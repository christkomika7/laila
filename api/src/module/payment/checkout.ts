import Elysia from "elysia";
import { env } from "../../env";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/payment";
import {
  checkStock,
  checkoutBodySchema,
  formatPawapayAmount,
  mapToStripeCurrency,
  toStripeAmount,
} from "../../lib/checkout";
import { computeTotal } from "../../lib/helpers";
import { auth } from "../../lib/auth";

export const checkoutRoutes = new Elysia({ prefix: "/checkout" }).post(
  "/",
  async ({ body, set, request }) => {
    const { email, name, items, paymentMethod } = body;

    const session = await auth.api
      .getSession({ headers: request.headers })
      .catch(() => null);
    const userId = session?.user?.id ?? undefined;

    const orderItemsData = await checkStock(items);
    const totalInCents = computeTotal(items);
    const currency = items[0].currency ?? "XAF";

    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name: name ?? undefined,
        phone: body.msisdn ?? undefined,
        country: body.country,
      },
      create: { email, name, phone: body.msisdn, country: body.country },
    });

    const { order, payment } = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          userId,
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
      console.log("[pawapay] Response status:", response.status);
      console.log("[pawapay] Response data:", JSON.stringify(data, null, 2));

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
      const msg = error instanceof Error ? error.message : "Erreur interne";
      if (msg.startsWith("Stock insuffisant")) {
        set.status = 422;
        return { error: msg };
      }
      set.status = 500;
      return { error: msg };
    },
  },
);
