import Elysia, { t } from "elysia";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/payment";
import {
  mapToStripeCurrency,
  toStripeAmount,
  formatPawapayAmount,
} from "../../lib/checkout";
import { env } from "../../env";
import { sendMailSafe } from "../../lib/mailer";
import { auth } from "../../lib/auth";

const donationBodySchema = t.Object({
  email: t.String({ format: "email" }),
  name: t.Optional(t.String()),
  amount: t.Number({ minimum: 500 }),
  currency: t.String(),
  paymentMethod: t.Union([t.Literal("mobile_money"), t.Literal("card")]),
  msisdn: t.Optional(t.String()),
  correspondent: t.Optional(t.String()),
  country: t.Optional(t.String()),
  userId: t.Optional(t.String()),
});

export const donationRoutes = new Elysia({ prefix: "/donations" })
  .post(
    "/",
    async ({ body, set, request }) => {
      const { email, name, amount, currency, paymentMethod } = body;

      const session = await auth.api
        .getSession({ headers: request.headers })
        .catch(() => null);
      const userId = session?.user?.id ?? undefined;

      const customer = await prisma.customer.upsert({
        where: { email },
        update: { name: name ?? undefined },
        create: { email, name },
      });

      const donation = await prisma.donation.create({
        data: {
          email,
          name,
          amountInCents: amount,
          currency,
          provider: paymentMethod === "card" ? "STRIPE" : "PAWAPAY",
          customerId: customer.id,
          userId,
          msisdn: body.msisdn,
          correspondent: body.correspondent,
          country: body.country,
          idempotencyKey: crypto.randomUUID(),
        },
      });

      if (paymentMethod === "card") {
        const intent = await stripe.paymentIntents.create(
          {
            amount: toStripeAmount(amount, currency),
            currency: mapToStripeCurrency(currency),
            receipt_email: email,
            metadata: {
              type: "donation",
              donationId: donation.id,
              donorEmail: email,
              donorName: name ?? "",
              customerId: customer.id,
            },
            automatic_payment_methods: { enabled: true },
          },
          { idempotencyKey: donation.idempotencyKey },
        );

        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            providerPaymentId: intent.id,
            stripeClientSecret: intent.client_secret,
            status: "PROCESSING",
          },
        });

        set.status = 201;

        await sendMailSafe({
          to: email,
          title: "💰 Merci pour votre don — Laïla Music",
          body: `
                <p>Bonjour <strong>${name ?? "cher donateur"}</strong>,</p>
                <p>Votre don de <strong>${amount.toLocaleString("fr-FR")} ${currency}</strong> a bien été reçu.</p>
                <p>Merci du fond du cœur 🎵</p>
              `,
        });

        await sendMailSafe({
          to: env.SMTP_USER,
          title: `💰 Nouveau don par Carte — ${amount.toLocaleString("fr-FR")} ${currency}`,
          body: `<p>Don reçu de <strong>${name ?? email}</strong> (${email}) via Carte.</p>`,
        });

        return {
          provider: "stripe",
          donationId: donation.id,
          clientSecret: intent.client_secret,
        };
      } else {
        if (!body.msisdn || !body.correspondent || !body.country) {
          set.status = 400;
          return { error: "msisdn, correspondent et country sont requis." };
        }

        const depositId = donation.idempotencyKey;
        const pawapayPayload = {
          depositId,
          amount: formatPawapayAmount(amount, currency),
          currency,
          payer: {
            type: "MMO",
            accountDetails: {
              phoneNumber: body.msisdn.replace(/\D/g, ""),
              provider: body.correspondent,
            },
          },
        };

        const response = await fetch(`${env.PAWAPAY_BASE_URL}/v2/deposits`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PAWAPAY_API_TOKEN}`,
          },
          body: JSON.stringify(pawapayPayload),
        });

        const data = await response.json();

        if (!response.ok || data.status === "REJECTED") {
          await prisma.donation.update({
            where: { id: donation.id },
            data: {
              status: "FAILED",
              failedAt: new Date(),
            },
          });
          set.status = 422;
          return {
            error: data.failureReason?.failureCode ?? "Don rejeté par PawaPay",
          };
        }

        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            providerPaymentId: depositId,
            status: "PROCESSING",
          },
        });

        set.status = 201;

        await sendMailSafe({
          to: donation.email,
          title: "💰 Merci pour votre don — Laïla Music",
          body: `
                    <p>Bonjour <strong>${name ?? "cher donateur"}</strong>,</p>
                    <p>Votre don de <strong>${amount.toLocaleString("fr-FR")} ${currency}</strong> a bien été reçu.</p>
                    <p>Merci du fond du cœur 🎵</p>
                  `,
        });

        await sendMailSafe({
          to: env.SMTP_USER,
          title: `💰 Nouveau don par Mobile Money — ${amount.toLocaleString("fr-FR")} ${currency}`,
          body: `<p>Don reçu de <strong>${name ?? email}</strong> (${email}) via Mobile Money.</p>`,
        });

        return {
          provider: "pawapay",
          donationId: donation.id,
          depositId,
          status: "ACCEPTED",
        };
      }
    },
    { body: donationBodySchema },
  )
  .get("/:id/status", async ({ params, set }) => {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      select: { status: true },
    });
    if (!donation) {
      set.status = 404;
      return { error: "Introuvable" };
    }
    return { status: donation.status };
  });
