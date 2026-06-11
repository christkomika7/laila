import Stripe from "stripe";
import { env } from "../env";
import { t } from "elysia";
import { prisma } from "./prisma";
import { Prisma } from "../../generated/prisma/client";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-05-27.dahlia",
});

export const pawapayCallbackSchema = t.Object({
  depositId: t.String(),
  status: t.Union([
    t.Literal("COMPLETED"),
    t.Literal("FAILED"),
    t.Literal("DUPLICATE_IGNORED"),
  ]),
  requestedAmount: t.String(),
  depositedAmount: t.Optional(t.String()),
  currency: t.String(),
  country: t.String(),
  correspondent: t.String(),
  payer: t.Object({
    type: t.Literal("MSISDN"),
    address: t.Object({ value: t.String() }),
  }),
  customerTimestamp: t.String(),
  statementDescription: t.String(),
  created: t.String(),
  respondedByPayer: t.Optional(t.String()),
  correspondentIds: t.Optional(t.Record(t.String(), t.String())),
  failureReason: t.Optional(
    t.Object({
      failureCode: t.String(),
      failureMessage: t.String(),
    }),
  ),
});

export type PawapayDepositStatus = "COMPLETED" | "FAILED" | "DUPLICATE_IGNORED";
export type PawapayCallback = typeof pawapayCallbackSchema.static;

export async function handleDepositCompleted(
  paymentId: string,
  orderId: string,
  cb: PawapayCallback,
) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        providerPaymentId: cb.depositId,
        capturedAmountInCents: cb.depositedAmount
          ? Math.round(parseFloat(cb.depositedAmount) * 100)
          : Math.round(parseFloat(cb.requestedAmount) * 100),
        capturedCurrency: cb.currency,
        completedAt: new Date(cb.respondedByPayer ?? cb.created),
        lastWebhookPayload: cb as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID", updatedAt: new Date() },
    });

    const orderItems = await tx.orderItem.findMany({
      where: { orderId },
      include: {
        variant: {
          select: { id: true, manageInventory: true, inventoryQuantity: true },
        },
      },
    });

    for (const item of orderItems) {
      if (item.variant?.manageInventory && item.variantId) {
        const newQty = Math.max(
          0,
          item.variant.inventoryQuantity - item.quantity,
        );
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inventoryQuantity: newQty },
        });
      }
    }
  });

  console.log(`[pawapay-webhook] Commande ${orderId} payée (Mobile Money)`);
}

export async function handleDepositFailed(
  paymentId: string,
  orderId: string,
  cb: PawapayCallback,
) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        failureReason: cb.failureReason?.failureCode ?? "DEPOSIT_FAILED",
        failedAt: new Date(),
        lastWebhookPayload: cb as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", updatedAt: new Date() },
    });
  });

  console.log(
    `[pawapay-webhook] Dépôt échoué pour commande ${orderId} — ${cb.failureReason?.failureCode}`,
  );
}

export async function handlePaymentIntentSucceeded(
  intent: Stripe.PaymentIntent,
) {
  const { orderId, paymentId } = intent.metadata ?? {};

  if (!orderId || !paymentId) {
    console.warn(
      "[stripe-webhook] Metadata manquante sur payment_intent:",
      intent.id,
    );
    return;
  }

  const charge = intent.latest_charge
    ? await stripe.charges.retrieve(intent.latest_charge as string)
    : null;

  const cardDetails = charge?.payment_method_details?.card;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        providerPaymentId: intent.id,
        providerChargeId: charge?.id,
        capturedAmountInCents: intent.amount_received,
        capturedCurrency: intent.currency.toUpperCase(),
        cardLast4: cardDetails?.last4,
        cardBrand: cardDetails?.brand,
        completedAt: new Date(),
        lastWebhookPayload: intent as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID", updatedAt: new Date() },
    });

    const orderItems = await tx.orderItem.findMany({
      where: { orderId },
      include: {
        variant: {
          select: { id: true, manageInventory: true, inventoryQuantity: true },
        },
      },
    });

    for (const item of orderItems) {
      if (item.variant?.manageInventory && item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
      }
    }
  });

  console.log(`[stripe-webhook] Commande ${orderId} payée avec succès`);
}

export async function handlePaymentIntentFailed(intent: Stripe.PaymentIntent) {
  const { orderId, paymentId } = intent.metadata ?? {};
  if (!orderId || !paymentId) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        failureReason:
          intent.last_payment_error?.code ??
          intent.last_payment_error?.message ??
          "PAYMENT_FAILED",
        failedAt: new Date(),
        lastWebhookPayload: intent as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", updatedAt: new Date() },
    });
  });

  console.log(`[stripe-webhook] Paiement échoué pour la commande ${orderId}`);
}

export async function handleChargeRefunded(charge: Stripe.Charge) {
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { providerChargeId: charge.id },
        { providerPaymentId: charge.payment_intent as string },
      ],
    },
  });

  if (!payment) {
    console.warn("[stripe-webhook] Charge introuvable en base:", charge.id);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "REFUNDED",
        lastWebhookPayload: charge as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "REFUNDED", updatedAt: new Date() },
    });

    if (charge.refunded) {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: payment.orderId },
        include: {
          variant: { select: { id: true, manageInventory: true } },
        },
      });

      for (const item of orderItems) {
        if (item.variant?.manageInventory && item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { inventoryQuantity: { increment: item.quantity } },
          });
        }
      }
    }
  });

  console.log(`[stripe-webhook] Commande ${payment.orderId} remboursée`);
}
