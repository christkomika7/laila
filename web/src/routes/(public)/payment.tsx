import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, Smartphone, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/(public)/payment")({
  validateSearch: (search: Record<string, unknown>) => ({
    depositId: (search.depositId as string) ?? null,
  }),
  head: () => ({
    title: "Validation du Paiement - Laila",
    meta: [],
  }),
  component: RouteComponent,
});

// ─── Fake data ────────────────────────────────────────────────────────────────

// Changer en 'failed' pour tester l'état d'échec
const FAKE_FINAL_STATUS: "completed" | "failed" = "completed";
const FAKE_RESOLVE_AFTER_SECONDS = 5;

// ─── Component ────────────────────────────────────────────────────────────────

function RouteComponent() {
  const { depositId } = useSearch({ from: "/(public)/payment" });
  const navigate = useNavigate();

  const [status, setStatus] = useState<"polling" | "completed" | "failed">(
    "polling",
  );
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (!depositId) {
      setError("ID de transaction manquant.");
      setStatus("failed");
      return;
    }

    const timeoutTimer = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev >= 300) {
          setStatus("failed");
          setError(
            "Le délai d'attente pour le paiement a expiré. Veuillez réessayer.",
          );
          clearInterval(timeoutTimer);
        }
        return prev + 1;
      });
    }, 1000);

    let elapsed = 0;
    const pollTimer = setInterval(async () => {
      if (statusRef.current !== "polling") return;
      elapsed += 1;

      try {
        // TODO: remplacer par :
        // const res = await apiServerClient.fetch(`/pawapay/deposit/${depositId}`);
        // const data = await res.json();

        const data =
          elapsed >= FAKE_RESOLVE_AFTER_SECONDS
            ? { status: FAKE_FINAL_STATUS }
            : { status: "pending" };

        if (data.status === "completed" || data.status === "successful") {
          clearInterval(pollTimer);
          clearInterval(timeoutTimer);
          setStatus("completed");
          setTimeout(
            () => navigate({ to: "/success", search: { depositId } }),
            1500,
          );
        } else if (data.status === "failed" || data.status === "rejected") {
          clearInterval(pollTimer);
          clearInterval(timeoutTimer);
          setStatus("failed");
          setError("Le paiement a été refusé ou annulé par l'opérateur.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 1000);

    return () => {
      clearInterval(pollTimer);
      clearInterval(timeoutTimer);
    };
  }, [depositId]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#111] border border-red-900/30 rounded-3xl p-8 sm:p-10 text-center shadow-2xl"
        >
          {status === "polling" && (
            <div className="space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 border-4 border-red-900/30 border-t-amber-500 rounded-full animate-spin" />
                <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-amber-500" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Validation requise
                </h2>
                <p className="text-red-200/70">
                  Veuillez consulter votre téléphone mobile et entrer votre code
                  PIN secret pour confirmer la transaction.
                </p>
              </div>

              <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4">
                <p className="text-amber-400 text-sm font-medium animate-pulse">
                  En attente de la réponse de l'opérateur...
                </p>
                <p className="text-xs text-amber-500/50 mt-2 font-mono">
                  Temps écoulé: {Math.floor(timeElapsed / 60)}:
                  {(timeElapsed % 60).toString().padStart(2, "0")} / 5:00
                </p>
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-6">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Paiement Réussi !
              </h2>
              <p className="text-green-400/70">
                Redirection vers votre confirmation...
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-6">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Paiement Échoué
                </h2>
                <p className="text-red-200/70">{error}</p>
              </div>
              <Button
                onClick={() => navigate({ to: "/checkout" })}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
