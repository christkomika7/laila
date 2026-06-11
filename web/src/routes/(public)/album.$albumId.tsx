import TrackCard from "#/components/card/track-card";
import Footer from "#/components/footer";
import PaymentForm from "#/components/form/payment-form";
import Header from "#/components/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import ImageWithFallback from "#/components/ui/image-with-fallback";
import PremiumButton from "#/components/ui/premiem.button";
import { useMusicStore } from "#/store/use-music-store";
import { useCartStore } from "#/store/use-cart-store";
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Disc,
  Music,
  ShoppingCart,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Track } from "#/types/album";
import { formatXAF } from "#/lib/utils";

const credits = [
  { role: "A&R", names: "Bob Mass" },
  { role: "Manager", names: "Karter Gilles" },
  { role: "Compositeurs", names: "Nick Silver, Gedeon beatz" },
  {
    role: "Instrumentistes",
    names: "Harold Nzaba (Saxo), Grace Lincompa (guitariste)",
  },
  { role: "Logistique", names: "Camron Depaul" },
  { role: "Director", names: "Dan Scott" },
  { role: "Photographe", names: "Jaddy Da Costa" },
  { role: "Scenario", names: "Michel Agaton" },
  { role: "Writers", names: "Laila, Ress vialy, Scary Sama, Sonxfgod, 2cyr" },
  { role: "Tech", names: "Nick Silver, Bob Mass" },
];

export const Route = createFileRoute("/(public)/album/$albumId")({
  head: () => ({
    title: "Album - Laila",
    meta: [{ property: "og:title", content: "Album - Laila" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { albumId } = useParams({ from: "/(public)/album/$albumId" });
  const navigate = useNavigate();

  const { albums, fetchPublicAlbums } = useMusicStore();

  const items = useCartStore.use.items();
  const addTrack = useCartStore.use.addTrack();
  const addAlbum = useCartStore.use.addAlbum();
  const removeItem = useCartStore.use.removeItem();

  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<
    string | null
  >(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<{
    type: "album" | "track";
    title: string;
    price: number;
    albumId?: string;
    trackId?: string;
  } | null>(null);

  useEffect(() => {
    if (albums.length === 0) fetchPublicAlbums();
  }, [albums.length, fetchPublicAlbums]);

  const album = albums.find((a) => a.id === albumId) ?? null;
  const loading = albums.length === 0;

  const totalPrice = album
    ? album.tracks.reduce((sum, t) => sum + t.price, 0)
    : 0;

  const albumCartKey = album ? `album:${album.id}` : "";
  const albumInCart = items.some((i) => i.id === albumCartKey);

  const handleAddTrackToCart = (track: Track) => {
    if (items.some((i) => i.id === `track:${track.id}`)) return;
    addTrack(track);
    toast.success(`« ${track.title} » ajouté au panier`);
  };

  const handleRemoveTrackFromCart = (track: Track) => {
    removeItem(`track:${track.id}`);
    toast.info(`« ${track.title} » retiré du panier`);
  };

  const handleAddAlbumToCart = () => {
    if (!album || albumInCart) return;
    addAlbum(album);
    toast.success(`« ${album.title} » ajouté au panier`);
  };

  const handleRemoveAlbumFromCart = () => {
    if (!album) return;
    removeItem(albumCartKey);
    toast.info(`« ${album.title} » retiré du panier`);
  };

  const handleBuyAlbum = () => {
    if (!album) return;
    setPurchaseItem({
      type: "album",
      title: album.title,
      price: totalPrice,
      albumId: album.id,
    });
    setIsPaymentModalOpen(true);
  };

  const handleBuyTrack = (track: Track) => {
    setPurchaseItem({
      type: "track",
      title: track.title,
      price: track.price,
      trackId: track.id,
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (depositId: string) => {
    setIsPaymentModalOpen(false);
    navigate({ to: `/payment-status/${depositId}` });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 aspect-square bg-[#1a1a1a] rounded-2xl" />
            <div className="lg:col-span-2 space-y-6">
              <div className="h-12 bg-[#1a1a1a] rounded w-3/4" />
              <div className="h-6 bg-[#1a1a1a] rounded w-1/2" />
              <div className="h-32 bg-[#1a1a1a] rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
          <Music className="h-20 w-20 mx-auto mb-6 text-red-500/50" />
          <h2 className="text-3xl font-bold mb-4 font-display">
            Album introuvable
          </h2>
          <Link to="/music">
            <PremiumButton
              variant="outline"
              className="border-red-900/50 text-red-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Catalogue
            </PremiumButton>
          </Link>
        </div>
      </div>
    );
  }

  const isResilience =
    album.title.toUpperCase().includes("RESILIENCE") ||
    album.title.toUpperCase().includes("RÉSILIENCE");
  const displayTitle = isResilience ? "RÉSILIENCE" : album.title;
  const priceDisplay = formatXAF(totalPrice);

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-red-50 font-sans selection:bg-red-900/50">
        <Header />

        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <main className="relative z-10 pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/music"
              className="inline-flex items-center text-red-200/50 hover:text-amber-400 transition-colors mb-8 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Catalogue
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16"
            >
              <div className="lg:col-span-5 space-y-8">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 relative group">
                  <ImageWithFallback
                    src={album.coverUrl ?? ""}
                    alt={displayTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div>
                  {isResilience && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/40 text-amber-400 font-semibold tracking-widest uppercase text-xs">
                        <Disc className="w-3 h-3 mr-2 animate-pulse" />
                        Lancement le 1er Mai
                      </span>
                    </div>
                  )}

                  <h1 className="text-4xl md:text-5xl font-bold mb-2 font-display tracking-tight text-white drop-shadow-md">
                    {displayTitle}
                  </h1>
                  <p className="text-xl text-amber-400 font-medium mb-6">
                    Laila
                  </p>

                  <div className="flex gap-4 text-sm text-white/40 mb-8 border-y border-white/10 py-4">
                    <p>
                      Sorti le{" "}
                      {new Date(album.releaseDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p>•</p>
                    <p>
                      {album.tracks.length} Titre
                      {album.tracks.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  {album.description && (
                    <p className="text-white/70 leading-relaxed mb-8 text-balance">
                      {album.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-3">
                    <PremiumButton
                      size="lg"
                      className="w-full text-lg bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold border-none shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_28px_rgba(245,158,11,0.35)] transition-all"
                      onClick={handleBuyAlbum}
                    >
                      <Smartphone className="h-5 w-5 mr-2" />
                      Acheter l'album • {priceDisplay}
                    </PremiumButton>

                    {albumInCart ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-green-600/30 bg-green-600/10 text-green-400">
                          <Check className="h-4 w-4 shrink-0" />
                          <span className="font-medium text-sm">
                            Album dans le panier
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveAlbumFromCart}
                          className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 border border-red-800/40 hover:border-red-600/50 bg-red-950/30 hover:bg-red-900/30 transition-all"
                        >
                          <X className="h-4 w-4" />
                          Retirer
                        </button>
                      </div>
                    ) : (
                      <PremiumButton
                        size="lg"
                        variant="outline"
                        onClick={handleAddAlbumToCart}
                        className="w-full text-lg border-white/15 hover:border-white/30 hover:bg-white/5 text-white/80 hover:text-white transition-all"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Ajouter au Panier
                      </PremiumButton>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col">
                <h2 className="text-2xl font-bold mb-6 font-display text-white border-b border-white/10 pb-4">
                  Liste des Titres
                </h2>

                {album.tracks.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                    <Music className="h-12 w-12 mx-auto mb-4 text-white/20" />
                    <p className="text-white/40">
                      Aucun titre disponible pour le moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-16">
                    {album.tracks.map((track: Track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <TrackCard
                          track={track}
                          index={index + 1}
                          onAddToCart={handleAddTrackToCart}
                          onRemoveFromCart={handleRemoveTrackFromCart}
                          onBuyNow={handleBuyTrack}
                          currentPlayingTrackId={currentPlayingTrackId}
                          onPlayStart={setCurrentPlayingTrackId}
                          isInCart={items.some(
                            (i) => i.id === `track:${track.id}`,
                          )}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {isResilience && (
                  <div className="mt-auto">
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                    >
                      <AccordionItem value="credits" className="border-none">
                        <AccordionTrigger className="px-6 py-4 text-xl font-bold font-display hover:no-underline text-white hover:bg-white/5 transition-colors">
                          Crédits & Informations
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            {credits.map((credit, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col border-b border-white/10 pb-3"
                              >
                                <span className="text-[11px] text-amber-400/80 uppercase tracking-widest font-semibold mb-1">
                                  {credit.role}
                                </span>
                                <span className="font-medium text-white/80 text-sm leading-snug">
                                  {credit.names}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-white">
              Acheter {purchaseItem?.type === "track" ? "le Titre" : "l'Album"}
            </DialogTitle>
            <DialogDescription className="text-white/50 mt-2">
              <span className="block text-white/80 font-medium mb-1">
                {purchaseItem?.title}
              </span>
              Payez en toute sécurité via Mobile Money.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PaymentForm
              amount={purchaseItem?.price ?? 0}
              albumId={purchaseItem?.albumId}
              trackId={purchaseItem?.trackId}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
