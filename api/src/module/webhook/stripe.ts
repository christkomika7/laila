import Elysia from "elysia";
import { prisma } from "../../lib/prisma";
import { env } from "../../env";
import {
  handleChargeRefunded,
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
  stripe,
} from "../../lib/payment";
import Stripe from "stripe";

export const stripeWebhookRoutes = new Elysia({ prefix: "/webhooks" }).post(
  "/stripe",
  async ({ request, set }) => {
    // ── 1. Lire le body RAW (obligatoire pour la signature Stripe) ─────────────
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      set.status = 400;
      return { error: "Signature manquante" };
    }

    // ── 2. Vérifier la signature ───────────────────────────────────────────────
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("[stripe-webhook] Signature invalide:", err);
      set.status = 400;
      return { error: "Signature invalide" };
    }

    // ── 3. Idempotency — éviter le double traitement ───────────────────────────
    try {
      await prisma.webhookEvent.create({
        data: { provider: "STRIPE", externalId: event.id, processed: false },
      });
    } catch {
      console.log(`[stripe-webhook] Événement déjà traité : ${event.id}`);
      return { received: true };
    }

    // ── 4. Dispatcher l'événement ─────────────────────────────────────────────
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "charge.refunded":
          await handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        default:
          break;
      }

      await prisma.webhookEvent.update({
        where: {
          provider_externalId: { provider: "STRIPE", externalId: event.id },
        },
        data: { processed: true },
      });
    } catch (err) {
      console.error("[stripe-webhook] Erreur traitement:", err);
      set.status = 500;
      return { error: "Erreur traitement" };
    }

    return { received: true };
  },
);
