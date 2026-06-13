import Footer from "#/components/footer";
import Header from "#/components/header";
import PremiumButton from "#/components/ui/premiem.button";
import { FAKE_RELEASES_BY_ID, type Release } from "#/data/fake";
import { formatXAF } from "#/lib/utils";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Disc, Music, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(public)/release$releaseId")({
  head: ({ params }) => ({
    title: `Release ${params.releaseId} - Laila`,
    meta: [
      { name: "description", content: "Découvrez cette sortie de Laila." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { releaseId } = useParams({ from: "/(public)/release$releaseId" });

  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Release[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRelease(FAKE_RELEASES_BY_ID[releaseId] ?? null);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [releaseId]);

  const handleAddToCart = () => {
    if (!release) return;
    setCart((prev) => [...prev, release]);
    toast.success(`« ${release.title} » ajouté au panier`);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-[#111] rounded-lg border border-red-950/30" />
            <div className="space-y-6 pt-8">
              <div className="h-12 bg-[#111] rounded w-3/4" />
              <div className="h-6  bg-[#111] rounded w-1/4" />
              <div className="h-32 bg-[#111] rounded w-full mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!release) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
          <Music className="h-20 w-20 mx-auto mb-6 text-red-500/50" />
          <h2 className="text-3xl font-bold mb-4 font-display">
            Release introuvable
          </h2>
          <Link to="/discography">
            <PremiumButton
              variant="outline"
              className="border-red-900/50 text-red-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la Discographie
            </PremiumButton>
          </Link>
        </div>
      </div>
    );
  }

  const priceDisplay = formatXAF(release.price);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-red-50 font-sans selection:bg-red-900/50">
      <Header />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/discography"
            className="inline-flex items-center text-red-200/60 hover:text-red-400 transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la Discographie
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start"
          >
            {/* Cover */}
            <div className="aspect-square rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-red-900/30 relative group bg-[#0d0d0d]">
              {release.videoUrl ? (
                <video
                  src={release.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <img
                  src={release.coverArt}
                  alt={release.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Détails */}
            <div className="flex flex-col h-full py-4 lg:py-8">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-red-500/30 bg-red-950/40 text-red-400 font-semibold tracking-widest uppercase text-xs mb-6">
                  {release.releaseType === "album" ? (
                    <Disc className="w-3 h-3 mr-2" />
                  ) : (
                    <Music className="w-3 h-3 mr-2" />
                  )}
                  {release.releaseType}
                </span>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-display tracking-tight text-white drop-shadow-md">
                  {release.title}
                </h1>
                <p className="text-2xl text-red-500 font-medium mb-6">
                  {release.artist}
                </p>
              </div>

              <div className="flex gap-4 text-sm text-red-200/60 mb-8 border-y border-red-900/30 py-4">
                <p>Sorti en {release.releaseYear}</p>
              </div>

              {release.description && (
                <p className="text-red-100/80 leading-relaxed text-lg text-balance mb-12">
                  {release.description}
                </p>
              )}

              <div className="mt-auto pt-8 border-t border-red-900/30">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-4xl font-bold text-white font-display">
                    {priceDisplay}
                  </div>
                  <PremiumButton
                    size="lg"
                    className="w-full sm:w-auto flex-1 text-lg bg-red-600 hover:bg-red-700 text-white border-none"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </PremiumButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
