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
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "laila",
    crossSubDomainCookies: {
      enabled: true,
      domain: env.DOMAIN,
    },
  },
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
      await sendMail({
        to: user.email,
        title: "Nouvelle inscription",
        body: `Quelqu'un a essayé de créer un compte en utilisant votre adresse e-mail. Si c'est vous, essayez de vous connecter au lieu de cela. Sinon, vous pouvez simplement ignorer cet e-mail.`,
      });
    },
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        title: "Réinitialisation de mot de passe",
        body: `Cliquez sur le lien pour réinitialiser votre mot de passe: ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${env.CLIENT_URL}/email-verified?token=${token}`;
      await sendMail({
        to: user.email,
        title: "Vérifier votre adresse e-mail",
        body: `Cliquez sur le lien pour vérifier votre adresse e-mail: ${verificationUrl}`,
      });
    },
  },
});
