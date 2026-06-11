import Elysia from "elysia";
import { env } from "../../env";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/payment";
import {
  checkStock,
  checkoutBodySchema,
  dialCodeDigits,
  formatPawapayAmount,
  mapToStripeCurrency,
  toStripeAmount,
} from "../../lib/checkout";
import { computeTotal } from "../../lib/helpers";

export const checkoutRoutes = new Elysia({ prefix: "/checkout" }).post(
  "/",
  async ({ body, set }) => {
    const { email, name, items, paymentMethod } = body;

    console.log(JSON.stringify(body, null, 2));

    // 1. Vérifier le stock
    const orderItemsData = await checkStock(items);
    const totalInCents = computeTotal(items);
    const currency = items[0].currency ?? "XAF";

    // 2. Upsert Customer
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name: name ?? undefined, phone: body.msisdn ?? undefined },
      create: { email, name, phone: body.msisdn },
    });

    // 3. Créer Order + OrderItems + Payment dans une transaction
    const { order, payment } = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          totalInCents,
          currency,
          billingCountry: body.billingCountry ?? body.country,
          items: { create: orderItemsData },
        },
      });

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: paymentMethod === "card" ? "STRIPE" : "PAWAPAY",
          status: "PENDING",
          idempotencyKey: crypto.randomUUID(),
          msisdn: body.msisdn,
          correspondent: body.correspondent,
          country: body.country,
          billingCountry: body.billingCountry,
        },
      });

      return { order, payment };
    });

    // 4. Initier le paiement chez le provider
    if (paymentMethod === "card") {
      const stripeCurrency = mapToStripeCurrency(currency);

      const intent = await stripe.paymentIntents.create(
        {
          amount: toStripeAmount(totalInCents, currency),
          currency: stripeCurrency,
          receipt_email: email,
          metadata: {
            orderId: order.id,
            paymentId: payment.id,
            customerEmail: email,
            customerName: name ?? "",
          },
          automatic_payment_methods: { enabled: true },
        },
        { idempotencyKey: payment.idempotencyKey },
      );

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: intent.id,
          stripeClientSecret: intent.client_secret,
          status: "PROCESSING",
          initiatedAt: new Date(),
        },
      });

      set.status = 201;
      return {
        provider: "stripe",
        orderId: order.id,
        paymentId: payment.id,
        clientSecret: intent.client_secret,
      };
    } else {
      // Mobile Money — PawaPay
      if (!body.msisdn || !body.correspondent || !body.country) {
        set.status = 400;
        return {
          error:
            "msisdn, correspondent et country sont requis pour Mobile Money",
        };
      }

      const depositId = payment.idempotencyKey;
      const amount = formatPawapayAmount(totalInCents, currency);

      const pawapayPayload = {
        depositId,
        amount,
        currency,
        correspondent: body.correspondent,
        payer: {
          type: "MSISDN",
          address: {
            value: body.msisdn
              .replace(/\D/g, "")
              .replace(/^0/, dialCodeDigits(body.country)),
          },
        },
        customerTimestamp: new Date().toISOString(),
        statementDescription: `Commande ${order.id.slice(-8).toUpperCase()}`,
      };

      const response = await fetch(`${env.PAWAPAY_BASE_URL}/deposits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PAWAPAY_API_TOKEN}`,
        },
        body: JSON.stringify(pawapayPayload),
      });

      const data = await response.json();

      if (!response.ok || data.status === "REJECTED") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            failureReason:
              data.rejectionReason?.rejectionCode ?? "REJECTED_BY_PAWAPAY",
            failedAt: new Date(),
            lastWebhookPayload: data,
          },
        });
        set.status = 422;
        return {
          error:
            data.rejectionReason?.rejectionCode ??
            "Paiement rejeté par PawaPay",
        };
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: depositId,
          status: "PROCESSING",
          initiatedAt: new Date(),
        },
      });

      set.status = 201;
      return {
        provider: "pawapay",
        orderId: order.id,
        paymentId: payment.id,
        depositId,
        status: "ACCEPTED",
      };
    }
  },
  {
    body: checkoutBodySchema,
    error({ error, set }) {
      set.status = 500;
      return {
        error: error instanceof Error ? error.message : "Erreur interne",
      };
    },
  },
);
