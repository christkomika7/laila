import Elysia, { t } from "elysia";
import { requireAdmin } from "../../middleware/secure";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { formatDonation, formatPayment } from "../../lib/payment";

const paymentInclude = {
  order: {
    include: {
      items: true,
      customer: { select: { name: true, email: true } },
      user: { select: { name: true, email: true } },
    },
  },
} as const;

export const invoiceRoutes = new Elysia({ prefix: "/invoices" })

  // GET /invoices/me
  .get("/me", async ({ request, set }) => {
    const session = await auth.api
      .getSession({ headers: request.headers })
      .catch(() => null);

    if (!session) {
      set.status = 401;
      return { error: "Non authentifié" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Récupère le customer lié à cet email (pour les achats sans compte)
    const customer = await prisma.customer.findUnique({
      where: { email: userEmail },
    });

    const [payments, donations] = await Promise.all([
      prisma.payment.findMany({
        where: {
          hide: false,
          order: {
            OR: [
              { userId },
              ...(customer ? [{ customerId: customer.id }] : []),
            ],
          },
        },
        include: paymentInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.donation.findMany({
        where: {
          hide: false,
          OR: [{ userId }, ...(customer ? [{ customerId: customer.id }] : [])],
        },
        include: {
          customer: { select: { name: true, email: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const invoices = [
      ...payments.map(formatPayment),
      ...donations.map(formatDonation),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return invoices;
  })

  // DELETE /invoices/me/:type/:id — soft delete (hide = true)
  .delete(
    "/me/:type/:id",
    async ({ request, params, set }) => {
      const session = await auth.api
        .getSession({ headers: request.headers })
        .catch(() => null);

      if (!session) {
        set.status = 401;
        return { error: "Non authentifié" };
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      const customer = await prisma.customer.findUnique({
        where: { email: userEmail },
      });

      const { type, id } = params;

      if (type === "payment") {
        const payment = await prisma.payment.findFirst({
          where: {
            id,
            order: {
              OR: [
                { userId },
                ...(customer ? [{ customerId: customer.id }] : []),
              ],
            },
          },
        });

        if (!payment) {
          set.status = 404;
          return { error: "Facture introuvable" };
        }

        await prisma.payment.update({
          where: { id },
          data: { hide: true },
        });
      } else if (type === "donation") {
        const donation = await prisma.donation.findFirst({
          where: {
            id,
            OR: [
              { userId },
              ...(customer ? [{ customerId: customer.id }] : []),
            ],
          },
        });

        if (!donation) {
          set.status = 404;
          return { error: "Don introuvable" };
        }

        await prisma.donation.update({
          where: { id },
          data: { hide: true },
        });
      } else {
        set.status = 400;
        return { error: "Type invalide. Utilise 'payment' ou 'donation'" };
      }

      set.status = 204;
    },
    {
      params: t.Object({
        type: t.Union([t.Literal("payment"), t.Literal("donation")]),
        id: t.String(),
      }),
    },
  )

  // GET /invoices — toutes les factures (payments + donations)
  .get(
    "/",
    async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 20);
      const skip = (page - 1) * limit;

      const [payments, donations, totalPayments, totalDonations] =
        await Promise.all([
          prisma.payment.findMany({
            include: paymentInclude,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.donation.findMany({
            include: {
              customer: { select: { name: true, email: true } },
              user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.payment.count(),
          prisma.donation.count(),
        ]);

      return {
        data: [
          ...payments.map((p) => ({ ...formatPayment(p), hide: p.hide })),
          ...donations.map((d) => ({ ...formatDonation(d), hide: d.hide })),
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        meta: {
          totalPayments,
          totalDonations,
          total: totalPayments + totalDonations,
          page,
          limit,
        },
      };
    },
    {
      beforeHandle: [requireAdmin],
      query: t.Optional(
        t.Object({
          page: t.Optional(t.String()),
          limit: t.Optional(t.String()),
        }),
      ),
    },
  )

  // GET /invoices/:type/:id — détail d'une facture
  .get(
    "/:type/:id",
    async ({ params, set }) => {
      const { type, id } = params;

      if (type === "payment") {
        const payment = await prisma.payment.findUnique({
          where: { id },
          include: paymentInclude,
        });
        if (!payment) {
          set.status = 404;
          return { error: "Introuvable" };
        }
        return { ...formatPayment(payment), hide: payment.hide };
      } else {
        const donation = await prisma.donation.findUnique({
          where: { id },
          include: {
            customer: { select: { name: true, email: true } },
            user: { select: { name: true, email: true } },
          },
        });
        if (!donation) {
          set.status = 404;
          return { error: "Introuvable" };
        }
        return { ...formatDonation(donation), hide: donation.hide };
      }
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({
        type: t.Union([t.Literal("payment"), t.Literal("donation")]),
        id: t.String(),
      }),
    },
  )

  // DELETE /invoices/:type/:id — vrai delete admin
  .delete(
    "/:type/:id",
    async ({ params, set }) => {
      const { type, id } = params;

      if (type === "payment") {
        // Cascade sur Order supprimera les OrderItems
        const payment = await prisma.payment.findUnique({
          where: { id },
          select: { orderId: true },
        });
        if (!payment) {
          set.status = 404;
          return { error: "Introuvable" };
        }
        await prisma.order.delete({ where: { id: payment.orderId } });
      } else if (type === "donation") {
        await prisma.donation.delete({ where: { id } });
      } else {
        set.status = 400;
        return { error: "Type invalide" };
      }

      set.status = 204;
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({
        type: t.Union([t.Literal("payment"), t.Literal("donation")]),
        id: t.String(),
      }),
    },
  );
