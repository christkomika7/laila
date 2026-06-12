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
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(auth)/register")({
  head: () => ({
    meta: [
      { title: "Inscription - Laïla Music" },
      {
        key: "og:title",
        property: "og:title",
        content: "Inscription - Laïla Music",
      },
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message ?? "Erreur lors de la création du compte.");
        return;
      }

      toast.success(
        "Compte créé avec succès ! Vérifiez votre boîte mail pour confirmer votre adresse.",
      );
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="grow flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-xl relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">
              Créer un compte
            </h1>
            <p className="text-muted-foreground">
              Rejoignez la communauté Laïla Music
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom Complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="pl-10 bg-background border-border text-foreground h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 bg-background border-border text-foreground h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 bg-background border-border text-foreground h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  S'inscrire <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Se connecter
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
