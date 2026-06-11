import Elysia, { t } from "elysia";
import { requireAdmin } from "../../middleware/secure";
import { prisma } from "../../lib/prisma";
import { sendMail } from "../../lib/mailer";
import { env } from "../../env";

const contactBodySchema = t.Object({
  name: t.String({ minLength: 2 }),
  email: t.String({ format: "email" }),
  phone: t.Optional(t.String()),
  subject: t.Union([
    t.Literal("booking"),
    t.Literal("press"),
    t.Literal("other"),
  ]),
  message: t.String({ minLength: 10 }),
});

export const contactRoutes = new Elysia({ prefix: "/contact" })
  // POST /contact — public, no auth required
  .post(
    "/",
    async ({ body, set }) => {
      const record = await prisma.contactMessage.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          subject: body.subject,
          message: body.message,
          status: "NEW",
        },
      });

      await sendMail({
        to: env.SMTP_USER,
        title: `Nouveau message de contact - ${body.subject}`,
        body: `De: ${body.name} (${body.email})\n\n${body.message}`,
      });

      set.status = 201;
      return { success: true, id: record.id };
    },
    { body: contactBodySchema },
  )

  // --- Routes admin (READ, UPDATE, DELETE) ---

  // GET /contact — list all messages
  .get(
    "/",
    async () => {
      const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
      });

      console.log({ messages });

      return messages;
    },
    { beforeHandle: [requireAdmin] },
  )

  // GET /contact/:id — single message
  .get(
    "/:id",
    async ({ params, set }) => {
      const msg = await prisma.contactMessage.findUnique({
        where: { id: params.id },
      });
      if (!msg) {
        set.status = 404;
        return { error: "Message not found" };
      }
      return msg;
    },
    { beforeHandle: [requireAdmin] },
  )

  // PATCH /contact/:id — update status
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const msg = await prisma.contactMessage.update({
        where: { id: params.id },
        data: { status: body.status },
      });
      return msg;
    },
    {
      beforeHandle: [requireAdmin],
      body: t.Object({
        status: t.Union([t.Literal("NEW"), t.Literal("READ")]),
      }),
    },
  )

  // DELETE /contact/:id
  .delete(
    "/:id",
    async ({ params, set }) => {
      await prisma.contactMessage.delete({ where: { id: params.id } });
      set.status = 204;
    },
    { beforeHandle: [requireAdmin] },
  );
