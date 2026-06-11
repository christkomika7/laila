import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "../env";
import { sendMail } from "./mailer";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [env.CLIENT_URL],
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        defaultValue: "user",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async ({ user }) => {
      void sendMail({
        to: user.email,
        title: "Nouvelle inscription",
        body: `Quelqu'un a essayé de créer un compte en utilisant votre adresse e-mail. Si c'est vous, essayez de vous connecter au lieu de cela. Sinon, vous pouvez simplement ignorer cet e-mail.`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${env.CLIENT_URL}/email-verified?token=${token}`;
      void sendMail({
        to: user.email,
        title: "Vérifier votre adresse e-mail",
        body: `Cliquez sur le lien pour vérifier votre adresse e-mail: ${verificationUrl}`,
      });
    },
  },
});
