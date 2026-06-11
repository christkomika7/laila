import Elysia, { t } from "elysia";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/payment";
import { mapToStripeCurrency, toStripeAmount } from "../../lib/checkout";

const donationBodySchema = t.Object({
  email: t.String({ format: "email" }),
  name: t.Optional(t.String()),
  amount: t.Number({ minimum: 500 }),
  currency: t.String(),
  paymentMethod: t.Union([t.Literal("mobile_money"), t.Literal("card")]),
  msisdn: t.Optional(t.String()),
  correspondent: t.Optional(t.String()),
  country: t.Optional(t.String()),
  billingCountry: t.Optional(t.String()),
});

export const donationRoutes = new Elysia({ prefix: "/donations" })
  .post(
    "/",
    async ({ body, set }) => {
      const { email, name, amount, currency, paymentMethod } = body;

      const donation = await prisma.donation.create({
        data: {
          email,
          name,
          amountInCents: amount,
          currency,
          provider: paymentMethod === "card" ? "STRIPE" : "PAWAPAY",
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
              donationId: donation.id,
              type: "donation",
              donorEmail: email,
              donorName: name ?? "",
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
        return {
          provider: "stripe",
          donationId: donation.id,
          clientSecret: intent.client_secret,
        };
      } else {
        // PawaPay — à implémenter selon le même pattern que checkout
        set.status = 501;
        return { error: "Mobile Money pour dons — à implémenter" };
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
