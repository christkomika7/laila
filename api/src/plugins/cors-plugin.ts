import { cors } from "@elysiajs/cors";
import { env } from "../env";

export const corsPlugin = cors({
  origin: [env.CLIENT_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
