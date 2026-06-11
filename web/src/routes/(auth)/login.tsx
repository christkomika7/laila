import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth-client";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(auth)/login")({
  head: () => ({
    meta: [
      { title: "Connexion - Laïla Music" },
      { property: "og:title", content: "Connexion - Laïla Music" },
    ],
  }),
  beforeLoad({ context }) {
    if (context.session) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error("Email ou mot de passe incorrect.");
        return;
      }

      toast.success("Connexion réussie !");

      const isAdmin = data?.user?.role === "admin";
      navigate({ to: isAdmin ? "/admin" : "/user", replace: true });
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Une erreur inattendue est survenue.");
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
          className="w-full max-w-md bg-[#141414] border border-neutral-800 rounded-2xl p-8 shadow-xl relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">
              Bon retour
            </h1>
            <p className="text-muted-foreground">
              Connectez-vous pour accéder à votre portail
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

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-background border-border text-foreground h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Se connecter <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Vous n'avez pas de compte ?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
