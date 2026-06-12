import Stripe from "stripe";
import { env } from "../env";
import { t } from "elysia";
import { prisma } from "./prisma";
import { Prisma } from "../../generated/prisma/client";
import { sendMailSafe } from "./mailer";

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
  amount: t.Optional(t.String()),
  currency: t.String(),
  country: t.Optional(t.String()),
  payer: t.Optional(
    t.Object({
      type: t.String(),
      accountDetails: t.Optional(
        t.Object({
          phoneNumber: t.String(),
          provider: t.String(),
        }),
      ),
    }),
  ),
  customerTimestamp: t.Optional(t.String()),
  statementDescription: t.Optional(t.String()),
  created: t.Optional(t.String()),
  providerTransactionId: t.Optional(t.String()),
  failureReason: t.Optional(
    t.Object({
      failureCode: t.String(),
      failureMessage: t.Optional(t.String()),
    }),
  ),
  requestedAmount: t.Optional(t.String()),
  depositedAmount: t.Optional(t.String()),
  correspondent: t.Optional(t.String()),
  respondedByPayer: t.Optional(t.String()),
  correspondentIds: t.Optional(t.Record(t.String(), t.String())),
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
        capturedAmountInCents: cb.amount
          ? Math.round(parseFloat(cb.amount) * 100)
          : Math.round(parseFloat(cb.requestedAmount ?? "0") * 100),
        capturedCurrency: cb.currency,
        completedAt: new Date(
          cb.respondedByPayer ?? cb.created ?? new Date().toISOString(),
        ),
        lastWebhookPayload: cb as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
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

    await incrementPurchaseCounts(orderId, tx);
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: true },
  });

  if (order?.customer?.email) {
    const itemsList = order.items
      .map(
        (i) =>
          `<li>${i.title} × ${i.quantity} — ${i.unitPriceInCents.toLocaleString("fr-FR")} ${order.currency}</li>`,
      )
      .join("");

    await sendMailSafe({
      to: env.SMTP_USER,
      title: `💰 Nouveau paiement MoMo — ${orderId.slice(-8).toUpperCase()}`,
      body: `
          <p><strong>Client :</strong> ${order.customer.name ?? "—"} (${order.customer.email})</p>
          <p><strong>Montant :</strong> ${order.totalInCents.toLocaleString("fr-FR")} ${order.currency}</p>
          <ul>${itemsList}</ul>
        `,
    });

    await sendMailSafe({
      to: order.customer.email,
      title: "✅ Paiement Mobile Money confirmé — Laïla Music",
      body: `
          <p>Bonjour <strong>${order.customer.name ?? "cher client"}</strong>,</p>
          <p>Votre paiement Mobile Money a été reçu avec succès.</p>
          <p><strong>Commande :</strong> ${orderId.slice(-8).toUpperCase()}</p>
          <ul>${itemsList}</ul>
          <p><strong>Total :</strong> ${order.totalInCents.toLocaleString("fr-FR")} ${order.currency}</p>
          <p>Merci pour votre confiance 🎵</p>
        `,
    });
  }
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

  console.log(`[pawapay-webhook] Dépôt échoué pour commande ${orderId}`);
}

export async function handlePaymentIntentSucceeded(
  intent: Stripe.PaymentIntent,
) {
  const { orderId, paymentId, type, donationId } = intent.metadata ?? {};
  if (type === "donation" && donationId) {
    await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: "COMPLETED",
        providerPaymentId: intent.id,
        completedAt: new Date(),
      },
    });

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });
    if (donation) {
      await sendMailSafe({
        to: env.SMTP_USER,
        title: `💚 Nouveau don reçu — ${donation.amountInCents.toLocaleString("fr-FR")} ${donation.currency}`,
        body: `<p>Don reçu de <strong>${donation.name ?? donation.email}</strong> (${donation.email}) : ${donation.amountInCents.toLocaleString("fr-FR")} ${donation.currency}</p>`,
      });

      await sendMailSafe({
        to: donation.email,
        title: "💚 Merci pour votre don — Laïla Music",
        body: `
          <p>Bonjour <strong>${donation.name ?? "cher donateur"}</strong>,</p>
          <p>Votre don de <strong>${donation.amountInCents.toLocaleString("fr-FR")} ${donation.currency}</strong> a bien été reçu.</p>
          <p>Merci du fond du cœur pour votre soutien 🎵</p>
        `,
      });
    }
    return;
  }

  // ── Cas commande ──
  if (!orderId || !paymentId) {
    console.warn("[stripe-webhook] Metadata manquante:", intent.id);
    return;
  }

  const charge = intent.latest_charge
    ? await stripe.charges.retrieve(intent.latest_charge as string)
    : null;

  const cardDetails = charge?.payment_method_details?.card;
  // Récupérer le pays depuis les billing_details Stripe
  const billingCountry = charge?.billing_details?.address?.country ?? undefined;

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
        billingCountry: billingCountry ?? undefined,
        completedAt: new Date(),
        lastWebhookPayload: intent as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID", updatedAt: new Date() },
    });

    // Mettre à jour le customer avec le pays si manquant
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });
    if (order && billingCountry) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { country: billingCountry },
      });
    }

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
    await incrementPurchaseCounts(orderId, tx);
  });

  // Emails
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: true },
  });

  if (order?.customer?.email) {
    const itemsList = order.items
      .map(
        (i) =>
          `<li>${i.title} × ${i.quantity} — ${i.unitPriceInCents.toLocaleString("fr-FR")} ${order.currency}</li>`,
      )
      .join("");

    await sendMailSafe({
      to: order.customer.email,
      title: "✅ Paiement confirmé — Laïla Music",
      body: `
        <p>Bonjour <strong>${order.customer.name ?? "cher client"}</strong>,</p>
        <p>Votre paiement par carte a été accepté.</p>
        <p><strong>Commande :</strong> ${orderId.slice(-8).toUpperCase()}</p>
        ${cardDetails ? `<p><strong>Carte :</strong> ${cardDetails.brand?.toUpperCase()} •••• ${cardDetails.last4}</p>` : ""}
        <ul>${itemsList}</ul>
        <p><strong>Total :</strong> ${order.totalInCents.toLocaleString("fr-FR")} ${order.currency}</p>
        <p>Merci pour votre confiance 🎵</p>
      `,
    });
    await sendMailSafe({
      to: env.SMTP_USER,
      title: `💳 Nouveau paiement carte — ${orderId.slice(-8).toUpperCase()}`,
      body: `
        <p><strong>Client :</strong> ${order.customer.name} (${order.customer.email})</p>
        <p><strong>Montant :</strong> ${order.totalInCents.toLocaleString("fr-FR")} ${order.currency}</p>
        <p><strong>Carte :</strong> ${cardDetails?.brand?.toUpperCase()} •••• ${cardDetails?.last4}</p>
        <ul>${itemsList}</ul>
      `,
    });
  }

  console.log(`[stripe-webhook] Commande ${orderId} payée avec succès`);
}

export async function handlePaymentIntentFailed(intent: Stripe.PaymentIntent) {
  const { orderId, paymentId, type, donationId } = intent.metadata ?? {};

  if (type === "donation" && donationId) {
    await prisma.donation.update({
      where: { id: donationId },
      data: { status: "FAILED", failedAt: new Date() },
    });
    return;
  }

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
    console.warn("[stripe-webhook] Charge introuvable:", charge.id);
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
        include: { variant: { select: { id: true, manageInventory: true } } },
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

export async function incrementPurchaseCounts(
  orderId: string,
  tx: Prisma.TransactionClient,
) {
  const orderItems = await tx.orderItem.findMany({
    where: { orderId },
    select: {
      trackId: true,
      albumId: true,
      quantity: true,
    },
  });

  const purchasedTrackIds = orderItems
    .filter((i) => i.trackId)
    .map((i) => i.trackId!);

  const purchasedAlbumIds = orderItems
    .filter((i) => i.albumId)
    .map((i) => i.albumId!);

  // Incrémenter les tracks achetées directement
  if (purchasedTrackIds.length > 0) {
    for (const item of orderItems.filter((i) => i.trackId)) {
      await tx.track.update({
        where: { id: item.trackId! },
        data: { purchaseCount: { increment: item.quantity } },
      });
    }

    // Vérifier si les tracks achetées constituent un album complet
    // Récupérer les albums liés aux tracks achetées
    const tracks = await tx.track.findMany({
      where: { id: { in: purchasedTrackIds } },
      select: { id: true, albumId: true },
    });

    // Grouper les tracks par album
    const albumTrackMap = new Map<string, string[]>();
    for (const track of tracks) {
      if (!track.albumId) continue;
      const existing = albumTrackMap.get(track.albumId) ?? [];
      albumTrackMap.set(track.albumId, [...existing, track.id]);
    }

    // Pour chaque album, vérifier si TOUTES ses tracks ont été achetées
    for (const [albumId, boughtTrackIds] of albumTrackMap.entries()) {
      const totalTracksInAlbum = await tx.track.count({
        where: { albumId },
      });

      if (boughtTrackIds.length === totalTracksInAlbum) {
        // Toutes les tracks de l'album sont achetées → incrémenter l'album aussi
        await tx.album.update({
          where: { id: albumId },
          data: { purchaseCount: { increment: 1 } },
        });
      }
      // Sinon : achat partiel → on n'incrémente pas l'album
    }
  }

  // Incrémenter les albums achetés directement
  // + toutes leurs tracks
  if (purchasedAlbumIds.length > 0) {
    for (const item of orderItems.filter((i) => i.albumId)) {
      await tx.album.update({
        where: { id: item.albumId! },
        data: { purchaseCount: { increment: item.quantity } },
      });

      // Incrémenter toutes les tracks de l'album
      await tx.track.updateMany({
        where: { albumId: item.albumId! },
        data: { purchaseCount: { increment: item.quantity } },
      });
    }
  }
}

export function formatPayment(p: any) {
  return {
    id: p.id,
    type: "payment" as const,
    status: p.status,
    provider: p.provider,
    totalInCents: p.order.totalInCents,
    currency: p.order.currency,
    createdAt: p.createdAt,
    completedAt: p.completedAt ?? null,
    items: p.order.items.map((i: any) => ({
      title: i.title,
      quantity: i.quantity,
      unitPriceInCents: i.unitPriceInCents,
      coverUrl: i.coverUrl ?? null,
    })),
    customer: {
      name: p.order.customer?.name ?? p.order.user?.name ?? null,
      email: p.order.customer?.email ?? p.order.user?.email ?? null,
      country: p.billingCountry ?? p.order.billingCountry ?? null,
    },
  };
}

export function formatDonation(d: any) {
  return {
    id: d.id,
    type: "donation" as const,
    status: d.status,
    provider: d.provider,
    totalInCents: d.amountInCents,
    currency: d.currency,
    createdAt: d.createdAt,
    completedAt: d.completedAt ?? null,
    customer: {
      name: d.name ?? d.customer?.name ?? d.user?.name ?? null,
      email: d.email ?? d.customer?.email ?? d.user?.email ?? null,
      country: d.country ?? null,
    },
  };
}
