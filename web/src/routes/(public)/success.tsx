import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import VideoAssetDisplay from "#/components/ui/video-asset-display";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(public)/success")({
  head: () => ({
    title: "Commande Confirmée - Laïla Music",
    meta: [
      {
        property: "description",
        content:
          "Votre commande a été confirmée avec succès. Merci pour votre achat sur Laïla Music",
      },
    ],
  }),
  component: RouteComponent,
});

// ─── Fake data ────────────────────────────────────────────────────────────────

const FAKE_VIDEO_URL =
  "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4";

const FAKE_ORDER = {
  id: "ORDER-20240615-001",
  status: "completed", // changer en 'pending' pour tester l'état en attente
  totalAmount: 510000, // en centimes
  created: new Date().toISOString(),
  isTransactionOnly: false,
  items: [
    {
      id: "item-1",
      title: "Résilience",
      type: "Album",
      coverUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&q=80",
      isResilience: true,
      fileExtension: "zip",
    },
    {
      id: "item-2",
      title: "Lumière d'Aube",
      type: "Titre",
      coverUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&q=80",
      isResilience: false,
      fileExtension: "mp3",
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

function RouteComponent() {
  const navigate = useNavigate();

  // TODO: remplacer par useSearchParams de TanStack Router quand dispo
  const orderId =
    new URLSearchParams(window.location.search).get("orderId") ||
    new URLSearchParams(window.location.search).get("depositId") ||
    "ORDER-20240615-001";

  // TODO: remplacer par les vrais hooks
  const videoUrl = FAKE_VIDEO_URL;
  const clearCart = () => {}; // TODO: useCart().clearCart
  const isDownloading = false; // TODO: useDownloadManager().isDownloading
  const downloadItem = (orderId: string, itemId: string, filename: string) => {
    // TODO: useDownloadManager().downloadItem
    console.log("[TODO] download", filename);
  };

  const [order, setOrder] = useState<typeof FAKE_ORDER | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearCart();

    const fetchOrder = async () => {
      try {
        // Simulation d'un délai réseau
        await new Promise((r) => setTimeout(r, 800));

        if (!orderId) {
          setError("Référence de commande manquante.");
          return;
        }

        // TODO: remplacer par pb.collection('orders').getOne(orderId, {...})
        setOrder(FAKE_ORDER);

        if (FAKE_ORDER.status === "completed") {
          const timer = setTimeout(() => navigate({ to: "/orders" }), 10000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        setError(
          "Commande introuvable. Elle est peut-être encore en cours de traitement.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        <main className="grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        <main className="grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111] border border-red-900/30 rounded-2xl p-8 text-center">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Traitement en cours
            </h1>
            <p className="text-red-200/70 mb-8">
              {error || "Votre commande est en cours de validation."}
            </p>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-900/50 text-white"
              >
                Rafraîchir la page
              </Button>
              <Link to="/store">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black">
                  Retour à la boutique
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Main ──────────────────────────────────────────────────────────────────

  const isSuccess = order.status === "completed";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      <Header />

      {isSuccess && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/10 blur-[120px] rounded-full" />
        </div>
      )}

      <main className="grow flex items-center justify-center py-24 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl w-full bg-[#111]/80 backdrop-blur-xl border border-red-900/30 rounded-3xl p-8 sm:p-12 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 mb-6"
            >
              {isSuccess ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <Clock className="w-12 h-12 text-amber-500" />
              )}
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              {isSuccess
                ? "Merci pour votre commande !"
                : "Commande en cours de traitement"}
            </h1>
            <p className="text-red-200/70 text-lg max-w-md mx-auto">
              {isSuccess
                ? "Votre paiement a été validé. Un e-mail de confirmation vous a été envoyé."
                : "Nous attendons la confirmation de votre paiement. Cela peut prendre quelques minutes."}
            </p>
          </div>

          {/* Order summary */}
          <div className="bg-[#161616] rounded-2xl p-6 border border-red-900/20 mb-8">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-red-900/20">
              <div>
                <p className="text-sm text-red-200/50 uppercase tracking-wider mb-1">
                  Numéro de commande
                </p>
                <p className="font-mono text-white font-medium">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-200/50 uppercase tracking-wider mb-1">
                  Total
                </p>
                <p className="font-mono text-amber-400 font-bold text-xl">
                  {order.totalAmount.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </div>

            {!order.isTransactionOnly && order.items.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-400" /> Articles (
                  {order.items.length})
                </h3>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded-xl border border-red-900/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                        {item.isResilience && videoUrl ? (
                          <VideoAssetDisplay
                            videoUrl={videoUrl}
                            posterUrl={item.coverUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-red-200/50">{item.type}</p>
                      </div>
                    </div>
                    {isSuccess && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                        onClick={() =>
                          downloadItem(
                            order.id,
                            item.id,
                            `${item.title}.${item.fileExtension}`,
                          )
                        }
                        disabled={isDownloading}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="w-full sm:w-auto">
              <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 px-8">
                Voir mes commandes <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/store" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-red-900/50 text-white hover:bg-red-950/30 h-12 px-8"
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Continuer les achats
              </Button>
            </Link>
          </div>

          {isSuccess && (
            <p className="text-center text-xs text-red-200/40 mt-6">
              Redirection automatique vers vos commandes dans quelques
              secondes...
            </p>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
