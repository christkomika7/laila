import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  runtimeEnv: import.meta.env,
  client: {
    VITE_SERVER_HOST: z.url({ error: "L'url du serveur est requis" }),
    VITE_STRIPE_PUBLIC_KEY: z.string({
      error: "La clé publique Stripe est requise",
    }),
  },
  clientPrefix: "VITE",
  emptyStringAsUndefined: true,
});
