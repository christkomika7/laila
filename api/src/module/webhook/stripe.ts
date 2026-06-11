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
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      set.status = 400;
      return { error: "Signature manquante" };
    }

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

    try {
      await prisma.webhookEvent.create({
        data: { provider: "STRIPE", externalId: event.id, processed: false },
      });
    } catch {
      console.log(`[stripe-webhook] Événement déjà traité : ${event.id}`);
      return { received: true };
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const intent = event.data.object as Stripe.PaymentIntent;
          if (intent.metadata?.type === "donation") {
            await prisma.donation.updateMany({
              where: { providerPaymentId: intent.id },
              data: { status: "COMPLETED", completedAt: new Date() },
            });
          } else {
            await handlePaymentIntentSucceeded(intent);
          }
          break;
        }

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
