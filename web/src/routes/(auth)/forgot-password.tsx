import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth-client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(auth)/forgot-password")({
  head: () => ({
    meta: [{ title: "Mot de passe oublié - Laïla Music" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError("Une erreur est survenue. Vérifiez l'adresse e-mail.");
        return;
      }

      setSent(true);
    } catch {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header />
      <main className="grow flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-700/6 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-[#141414] border border-neutral-800 rounded-lg p-8 shadow-xl relative z-10"
        >
          {sent ? (
            // ── État succès ──
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              </motion.div>
              <h2 className="text-2xl font-bold font-display text-foreground">
                E-mail envoyé
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Si un compte existe pour{" "}
                <span className="text-foreground font-medium">{email}</span>,
                vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-xs text-muted-foreground">
                Pensez à vérifier vos spams.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </motion.div>
          ) : (
            // ── Formulaire ──
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-display text-foreground mb-2">
                  Mot de passe oublié
                </h1>
                <p className="text-muted-foreground text-sm">
                  Entrez votre e-mail, nous vous enverrons un lien de
                  réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean@exemple.com"
                      className="pl-10 bg-background border-border text-foreground h-12"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Envoyer le lien"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
