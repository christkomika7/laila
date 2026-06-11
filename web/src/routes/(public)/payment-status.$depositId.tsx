import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/(public)/payment-status/$depositId")({
  head: () => ({
    title: "Statut du Paiement - Laila",
    meta: [],
  }),
  component: RouteComponent,
});

// ─── Fake data ────────────────────────────────────────────────────────────────

// Changer en 'failed' pour tester l'état d'échec
const FAKE_FINAL_STATUS: "completed" | "failed" = "completed";
const FAKE_RESOLVE_AFTER_SECONDS = 4;

// ─── Component ────────────────────────────────────────────────────────────────

function RouteComponent() {
  const { depositId } = useParams({
    from: "/(public)/payment-status/$depositId",
  });
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

    // Timeout 5 minutes
    const timeoutTimer = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev >= 300) {
          setStatus("failed");
          setError(
            "Le délai d'attente a expiré. Si vous avez été débité, veuillez contacter le support.",
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
          setError("La transaction a été rejetée par l'opérateur mobile.");
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#111] border border-red-900/30 rounded-3xl p-8 sm:p-10 text-center shadow-2xl"
        >
          {status === "polling" && (
            <div className="space-y-6">
              <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Vérification en cours
                </h2>
                <p className="text-red-200/70">
                  Nous vérifions le statut de votre paiement auprès de
                  l'opérateur. Ne fermez pas cette page.
                </p>
              </div>
              <p className="text-xs text-red-200/40 font-mono">
                ID: {depositId}
              </p>
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-6">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
              <h2 className="text-2xl font-bold text-white">
                Paiement Confirmé
              </h2>
              <p className="text-green-400/70">
                Préparation de votre commande...
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-6">
              <XCircle className="w-20 h-20 text-red-500 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Échec de la transaction
                </h2>
                <p className="text-red-200/70">{error}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate({ to: "/checkout" })}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black h-12"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Réessayer le paiement
                </Button>
                <Link to="/store">
                  <Button
                    variant="ghost"
                    className="w-full text-red-200/60 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
