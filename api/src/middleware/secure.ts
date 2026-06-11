import type { Context } from "elysia";
import { auth } from "../lib/auth";

export async function requireAdmin({ request, set, store }: Context) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    set.status = 401;
    throw new Error("Non authentifié");
  }

  if (session.user.role !== "admin") {
    set.status = 403;
    throw new Error("Accès refusé : rôle admin requis");
  }
}
