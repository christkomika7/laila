import Elysia from "elysia";
import { prisma } from "../../lib/prisma";

export const paymentStatusRoutes = new Elysia({ prefix: "/payments" }).get(
  "/:id/status",
  async ({ params, set }) => {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      select: { status: true },
    });

    if (!payment) {
      set.status = 404;
      return { error: "Paiement introuvable" };
    }

    return { status: payment.status };
  },
);
