import Elysia from "elysia";
import { prisma } from "../../lib/prisma";
import {
  handleDepositCompleted,
  handleDepositFailed,
  pawapayCallbackSchema,
  PawapayDepositStatus,
} from "../../lib/payment";

export const pawapayWebhookRoutes = new Elysia({ prefix: "/webhooks" }).post(
  "/pawapay",
  async ({ body, set }) => {
    const { depositId, status } = body;

    const eventKey = `${depositId}:${status}`;
    try {
      await prisma.webhookEvent.create({
        data: { provider: "PAWAPAY", externalId: eventKey, processed: false },
      });
    } catch {
      console.log(`[pawapay-webhook] Callback déjà traité : ${eventKey}`);
      return { received: true };
    }

    try {
      // Retrouver le Payment via depositId (= idempotencyKey envoyé lors du dépôt)
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [{ providerPaymentId: depositId }, { idempotencyKey: depositId }],
          provider: "PAWAPAY",
        },
      });

      if (!payment) {
        console.warn(
          `[pawapay-webhook] Payment introuvable pour depositId: ${depositId}`,
        );
        // 200 pour éviter les retries PawaPay sur un ID inconnu
        return { received: true };
      }

      switch (status as PawapayDepositStatus) {
        case "COMPLETED":
          await handleDepositCompleted(payment.id, payment.orderId, body);
          break;

        case "FAILED":
          await handleDepositFailed(payment.id, payment.orderId, body);
          break;

        case "DUPLICATE_IGNORED":
          console.log(`[pawapay-webhook] Dépôt dupliqué ignoré : ${depositId}`);
          break;

        default:
          console.warn(`[pawapay-webhook] Statut inconnu : ${status}`);
      }

      await prisma.webhookEvent.update({
        where: {
          provider_externalId: { provider: "PAWAPAY", externalId: eventKey },
        },
        data: { processed: true },
      });
    } catch (err) {
      console.error("[pawapay-webhook] Erreur traitement:", err);
      set.status = 500;
      return { error: "Erreur traitement" };
    }

    // PawaPay attend un 200 pour considérer le callback comme reçu
    return { received: true };
  },
  { body: pawapayCallbackSchema },
);
