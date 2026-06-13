import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth-client";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(auth)/reset-password")({
  head: () => ({
    meta: [{ title: "Nouveau mot de passe - Laïla Music" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  // ← Lire le token depuis l'URL au montage
  const token = new URLSearchParams(window.location.search).get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6)
      return { label: "Trop court", color: "bg-red-500", width: "w-1/4" };
    if (password.length < 10)
      return { label: "Moyen", color: "bg-amber-500", width: "w-2/4" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return { label: "Bon", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Fort", color: "bg-emerald-500", width: "w-full" };
  })();

  // Si pas de token dans l'URL, afficher une erreur directement
  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <Header />
        <main className="grow flex items-center justify-center px-4 pt-24 pb-12">
          <div className="w-full max-w-md bg-[#141414] border border-neutral-800 rounded-lg p-8 shadow-xl text-center space-y-4">
            <h2 className="text-2xl font-bold font-display text-white">
              Lien invalide
            </h2>
            <p className="text-neutral-400 text-sm">
              Ce lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Demander un nouveau lien
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setError(
          "Lien invalide ou expiré. Recommencez depuis la page de connexion.",
        );
        return;
      }

      setDone(true);
      toast.success("Mot de passe mis à jour !");
      setTimeout(() => navigate({ to: "/login" }), 3000);
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
          {done ? (
            // ── Succès ──
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
                Mot de passe mis à jour
              </h2>
              <p className="text-muted-foreground text-sm">
                Vous allez être redirigé vers la page de connexion…
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Se connecter maintenant
              </Link>
            </motion.div>
          ) : (
            // ── Formulaire ──
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-display text-foreground mb-2">
                  Nouveau mot de passe
                </h1>
                <p className="text-muted-foreground text-sm">
                  Choisissez un mot de passe sécurisé pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-background border-border text-foreground h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {passwordStrength && (
                    <div className="space-y-1">
                      <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: undefined }}
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Force :{" "}
                        <span className="text-foreground">
                          {passwordStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 bg-background border-border text-foreground h-12 ${
                        confirm && confirm !== password
                          ? "border-red-500/50 focus-visible:ring-red-500/30"
                          : confirm && confirm === password
                            ? "border-emerald-500/50"
                            : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-400">
                      Les mots de passe ne correspondent pas.
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                  disabled={loading || !password || !confirm}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Mettre à jour"
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
