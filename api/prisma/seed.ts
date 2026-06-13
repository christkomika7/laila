import { randomUUID } from "crypto";
import { env } from "../src/env";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = env.SMTP_USER;

  if (!email) {
    console.error(
      "L'adresse e-mail SMTP_USER n'est pas définie dans l'environnement.",
    );
    process.exit(1);
  }

  // Vérifie si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`L'utilisateur avec l'e-mail ${email} existe déjà.`);

    // Met à jour le rôle en admin s'il ne l'est pas
    if (existingUser.role !== "admin") {
      await prisma.user.update({
        where: { email },
        data: { role: "admin" },
      });
      console.log(`Rôle mis à jour: admin`);
    }
    return;
  }

  const userId = randomUUID();

  // Crée l'utilisateur avec le rôle admin et un mot de passe vide
  await prisma.user.create({
    data: {
      id: userId,
      name: "Admin",
      email: email,
      emailVerified: true,
      role: "admin",
      accounts: {
        create: {
          id: randomUUID(),
          accountId: email,
          providerId: "credential",
          password: "mot_de_passe",
        },
      },
    },
  });

  console.log(`Utilisateur admin créé avec succès avec l'e-mail: ${email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
