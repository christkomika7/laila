import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Music, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(auth)/email-verified")({
  head: () => ({
    title: "Email Vérifié - Laïla Music",
    meta: [
      {
        property: "description",
        content: "Votre adresse e-mail a été vérifiée avec succès.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? null,
  }),
  component: RouteComponent,
});

type Status = "loading" | "verified" | "error";

function RouteComponent() {
  const { token } = Route.useSearch();
  const { session } = Route.useRouteContext();
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");

  useEffect(() => {
    if (!token) return;

    authClient.verifyEmail({
      query: { token },
      fetchOptions: {
        onSuccess: () => setStatus("verified"),
        onError: () => setStatus("error"),
      },
    });
  }, [token]);

  const portalTo = session?.user.role === "admin" ? "/admin" : "/user";

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
        <Header />
        <main className="grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-green-200/60">Vérification en cours...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
        <Header />
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-500/10 blur-[120px] rounded-full" />
        </div>
        <main className="grow flex items-center justify-center py-24 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-lg w-full bg-[#111]/80 backdrop-blur-xl border border-red-900/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-6"
            >
              <XCircle className="w-12 h-12 text-red-500" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-white mb-4">
              Lien invalide ou expiré
            </h1>
            <p className="text-red-200/60 text-lg mb-8">
              Ce lien de vérification est invalide ou a expiré. Veuillez vous
              reconnecter pour recevoir un nouveau lien.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="w-full sm:w-auto">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 px-8">
                  Se connecter <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-red-900/50 text-white hover:bg-red-950/30 h-12 px-8"
                >
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Success ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      <Header />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="grow flex items-center justify-center py-24 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-lg w-full bg-[#111]/80 backdrop-blur-xl border border-green-900/30 rounded-3xl p-8 sm:p-12 shadow-2xl"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-3xl sm:text-4xl font-display font-bold text-white mb-4"
            >
              Email vérifié !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-green-200/70 text-lg max-w-sm mx-auto"
            >
              Votre adresse e-mail a été confirmée et votre compte est désormais
              actif.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-[#161616] rounded-lg p-6 border border-green-900/20 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Music className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  Bienvenue sur Laïla Music
                </p>
                <p className="text-sm text-green-200/50">
                  Vous pouvez maintenant accéder à votre portail, télécharger
                  vos titres et gérer vos commandes.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to={portalTo} className="w-full sm:w-auto">
              <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 px-8">
                Accéder à mon portail <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-green-900/50 text-white hover:bg-green-950/30 h-12 px-8"
              >
                Retour à l'accueil
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
