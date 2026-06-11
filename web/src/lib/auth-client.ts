import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "./env";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_HOST,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: ["user", "admin"],
          defaultValue: "user",
          input: false,
        },
      },
    }),
  ],
});
