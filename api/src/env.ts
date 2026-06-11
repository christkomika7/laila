import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    APP_ENV: z.enum(["development", "production"]),
    CLIENT_URL: z.url(),
    DATABASE_URL: z.url(),
    PORT: z.string().min(4).max(4),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string().min(3).max(3),
    SMTP_SECURE: z.string(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_FROM_ADDRESS: z.string(),
    SMTP_FROM_NAME: z.string(),

    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),

    PAWAPAY_API_TOKEN: z.string(),
    PAWAPAY_BASE_URL: z.string(),
    PAWAPAY_CALLBACK_URL: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
