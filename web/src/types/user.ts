import type { authClient } from "#/lib/auth-client";

type Session = typeof authClient.$Infer.Session;

export type RouterContext = {
  session: Session | null;
};
