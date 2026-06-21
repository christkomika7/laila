import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    APP_ENV: z.enum(["development", "production"]),
    DOMAIN: z.string({ error: "Le domaine doit être défini" }),
    CLIENT_URL: z.url({ error: "L'URL du client doit être définie" }),
    DATABASE_URL: z.url({
      error: "L'URL de la base de données doit être définie",
    }),
    PORT: z.string().min(4).max(4, { error: "Le port doit être défini" }),
    BETTER_AUTH_URL: z.url({ error: "L'URL de better-auth doit être définie" }),
    BETTER_AUTH_SECRET: z.string({
      error: "Le secret de better-auth doit être défini",
    }),
    SMTP_HOST: z.string({ error: "L'hôte SMTP doit être défini" }),
    SMTP_PORT: z
      .string()
      .min(3)
      .max(3, { error: "Le port SMTP doit être défini" }),
    SMTP_SECURE: z.string({ error: "La sécurité SMTP doit être définie" }),
    SMTP_USER: z.string({ error: "L'utilisateur SMTP doit être défini" }),
    SMTP_PASS: z.string({ error: "Le mot de passe SMTP doit être défini" }),
    SMTP_FROM_ADDRESS: z.string({
      error: "L'adresse e-mail SMTP doit être définie",
    }),
    SMTP_FROM_NAME: z.string({ error: "Le nom SMTP doit être défini" }),

    STRIPE_SECRET_KEY: z.string({
      error: "La clé secrète Stripe doit être définie",
    }),
    STRIPE_WEBHOOK_SECRET: z.string({
      error: "Le secret du webhook Stripe doit être défini",
    }),

    PAWAPAY_API_TOKEN: z.string({
      error: "Le token API de Pawapay doit être défini",
    }),
    PAWAPAY_BASE_URL: z.string({
      error: "L'URL de base de Pawapay doit être définie",
    }),
    PAWAPAY_CALLBACK_URL: z.string({
      error: "L'URL de rappel de Pawapay doit être définie",
    }),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
