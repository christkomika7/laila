import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  runtimeEnv: import.meta.env,
  client: {
    VITE_SERVER_HOST: z.url({ error: "L'url du serveur est requis" }),
    VITE_DOMAIN: z.url({ error: "L'url du client est requis" }),
    VITE_CLIENT_PORT: z
      .string({ error: "Le port du client est requis" })
      .min(4, "Le port du client est invalide")
      .max(4, "Le port du client est invalide"),
    VITE_STRIPE_PUBLIC_KEY: z.string({
      error: "La clé publique Stripe est requise",
    }),
  },
  clientPrefix: "VITE",
  emptyStringAsUndefined: true,
});
