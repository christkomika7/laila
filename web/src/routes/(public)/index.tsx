import FlipCard from "#/components/card/flip-card";
import Footer from "#/components/footer";
import Header from "#/components/header";
import ImageWithFallback from "#/components/ui/image-with-fallback";
import PremiumButton from "#/components/ui/premiem.button";
import VideoAssetDisplay from "#/components/ui/video-asset-display";
import TrackCard from "#/components/card/track-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { useVideoAsset } from "#/hook/use-video-asset";
import { useCartStore } from "#/store/use-cart-store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Disc,
  Music,
  Play,
  ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ResilienceVideo from "../../assets/album_resilience.mp4";
import apiServerClient from "#/lib/api";
import { isResilience, resolveImg } from "#/lib/helpers";
import type { Album, Track } from "#/types/album";
import type { GalleryItem } from "#/types/gallery";
import { toast } from "sonner";
import PaymentForm from "#/components/form/payment-form";

export const Route = createFileRoute("/(public)/")({
  head: () => ({
    meta: [{ title: "Bienvenu chez Laila Music" }],
  }),
  component: RouteComponent,
});

const RESILIENCE_SPECIAL_MEDIA = ResilienceVideo;

const albumUrl =
  "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/7a4a1a0cb5f2892ed82d2e39d86aad60.png";
const aboutUrl1 =
  "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/2b434cfc78b85547b562c7954e4f764a.png";
const aboutUrl2 =
  "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/c6ce30c59fb0dcf61745eeac97dd3fbb.jpg";
const aboutUrl3 =
  "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/cefc09cba6d3c707651d4d42c0c7907e.jpg";
const lailaLogoUrl =
  "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/f17982153cc76fcc048f5cef0e446f0d.png";

type PurchaseItem = {
  type: "track" | "album";
  title: string;
  price: number;
  albumId?: string;
  trackId?: string;
};

function RouteComponent() {
  const heroCarousel = [
    {
      id: "h1",
      title: "Résilience",
      imageUrl:
        "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/2b434cfc78b85547b562c7954e4f764a.png",
    },
    {
      id: "h2",
      title: "Pili Pili",
      imageUrl:
        "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/c6ce30c59fb0dcf61745eeac97dd3fbb.jpg",
    },
    {
      id: "h3",
      title: "Laïla en scène",
      imageUrl:
        "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/cefc09cba6d3c707651d4d42c0c7907e.jpg",
    },
  ];
  const [heroCarouselIndex, setHeroCarouselIndex] = useState<number>(0);
  const [latestAlbum, setLatestAlbum] = useState<Album | null>(null);
  const [isAlbumLoading, setIsAlbumLoading] = useState<boolean>(true);
  const [exclusiveGallery, setExclusiveGallery] = useState<GalleryItem[]>([]);
  const [isExclusiveLoading, setIsExclusiveLoading] = useState<boolean>(true);
  const [exclusiveError, setExclusiveError] = useState<string | null>(null);
  const [publicGallery, setPublicGallery] = useState<GalleryItem[]>([]);
  const [isPublicGalleryLoading, setIsPublicGalleryLoading] =
    useState<boolean>(true);
  const [galleryCarouselIndex, setGalleryCarouselIndex] = useState<number>(0);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<
    string | null
  >(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<PurchaseItem | null>(null);

  const items = useCartStore.use.items();
  const addTrack = useCartStore.use.addTrack();
  const addAlbum = useCartStore.use.addAlbum();
  const removeItem = useCartStore.use.removeItem();

  const { videoUrl: featuredVideoUrl } = useVideoAsset();

  useEffect(() => {
    const fetchLatestAlbum = async () => {
      try {
        const res = await apiServerClient.fetch("/music/albums");
        if (!res.ok) throw new Error();
        const data: any[] = await res.json();
        if (data.length === 0) return;
        setLatestAlbum(data[0]);
      } catch {
      } finally {
        setIsAlbumLoading(false);
      }
    };
    fetchLatestAlbum();
  }, []);

  useEffect(() => {
    const fetchExclusive = async () => {
      try {
        const res = await apiServerClient.fetch("/gallery");
        if (!res.ok) throw new Error();
        const data: GalleryItem[] = await res.json();
        const exclusive = data
          .filter((item) => item.isExclusive === true)
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime(),
          )
          .slice(0, 3);
        setExclusiveGallery(exclusive);
      } catch {
        setExclusiveError("Impossible de charger les contenus exclusifs.");
      } finally {
        setIsExclusiveLoading(false);
      }
    };
    fetchExclusive();
  }, []);

  useEffect(() => {
    const fetchPublicGallery = async () => {
      try {
        const res = await apiServerClient.fetch("/gallery");
        if (!res.ok) throw new Error();
        const data: any[] = await res.json();
        const publicItems = data
          .filter((item) => item.isExclusive !== true)
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime(),
          )
          .slice(0, 10);
        setPublicGallery(publicItems);
      } catch {
      } finally {
        setIsPublicGalleryLoading(false);
      }
    };
    fetchPublicGallery();
  }, []);

  useEffect(() => {
    if (heroCarousel.length <= 1) return;
    const interval = setInterval(() => {
      setHeroCarouselIndex((prev) => (prev + 1) % heroCarousel.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroCarousel.length]);

  useEffect(() => {
    if (publicGallery.length <= 1) return;
    const interval = setInterval(() => {
      setGalleryCarouselIndex((prev) => (prev + 1) % publicGallery.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [publicGallery.length]);

  const latestIsResilience = latestAlbum
    ? isResilience(latestAlbum.title)
    : false;
  const featuredCoverUrl = latestIsResilience
    ? RESILIENCE_SPECIAL_MEDIA
    : (latestAlbum?.coverUrl ?? albumUrl);
  const featuredTitle = latestAlbum?.title ?? "RÉSILIENCE";
  const featuredDescription =
    latestAlbum?.description ??
    'Plongez dans le chef-d\'œuvre. "RÉSILIENCE" mêle des mélodies captivantes à une émotion brute, offrant une expérience auditive premium.';

  const albumCartKey = latestAlbum ? `album:${latestAlbum.id}` : null;
  const albumInCart = albumCartKey
    ? items.some((i) => i.id === albumCartKey)
    : false;

  const handleAddTrackToCart = useCallback(
    (track: Track) => {
      addTrack(track);
      toast.success(`« ${track.title} » ajouté au panier`);
    },
    [addTrack],
  );

  const handleRemoveTrackFromCart = useCallback(
    (track: Track) => {
      removeItem(`track:${track.id}`);
      toast.info(`« ${track.title} » retiré du panier`);
    },
    [removeItem],
  );

  const handleAddAlbumToCart = useCallback(() => {
    if (!latestAlbum || albumInCart) return;
    addAlbum(latestAlbum);
    toast.success(`« ${latestAlbum.title} » ajouté au panier`);
  }, [latestAlbum, albumInCart, addAlbum]);

  const handleRemoveAlbumFromCart = useCallback(() => {
    if (!albumCartKey || !latestAlbum) return;
    removeItem(albumCartKey);
    toast.info(`« ${latestAlbum.title} » retiré du panier`);
  }, [albumCartKey, latestAlbum, removeItem]);

  const openPaymentModal = useCallback((item: PurchaseItem) => {
    setPurchaseItem(item);
    setIsPaymentModalOpen(true);
  }, []);

  const handleBuyAlbum = useCallback(() => {
    if (!latestAlbum) return;
    const totalPrice = latestAlbum.tracks.reduce(
      (sum, t) => sum + (t.price ?? 0),
      0,
    );
    openPaymentModal({
      type: "album",
      title: latestAlbum.title,
      price: totalPrice,
      albumId: latestAlbum.id,
    });
  }, [latestAlbum, openPaymentModal]);

  const handleBuyTrack = useCallback(
    (track: Track) => {
      openPaymentModal({
        type: "track",
        title: track.title,
        price: track.price ?? 850,
        trackId: track.id,
        albumId: latestAlbum?.id,
      });
    },
    [latestAlbum, openPaymentModal],
  );

  const handlePaymentSuccess = useCallback(() => {
    setIsPaymentModalOpen(false);
    setPurchaseItem(null);
    toast.success("Paiement effectué avec succès !");
  }, []);

  const nextSlide = () =>
    setGalleryCarouselIndex((prev) => (prev + 1) % publicGallery.length);
  const prevSlide = () =>
    setGalleryCarouselIndex(
      (prev) => (prev - 1 + publicGallery.length) % publicGallery.length,
    );

  console.log({ latestAlbum });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Header />

      <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          <AnimatePresence>
            <motion.img
              key={heroCarouselIndex}
              src={resolveImg(heroCarousel[heroCarouselIndex]) ?? ""}
              alt={heroCarousel[heroCarouselIndex].title || "Hero background"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>
          <div className="absolute inset-0 hero-overlay-gradient mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>

        <div className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="max-w-3xl mx-auto flex flex-col items-center"
          >
            <img
              src={lailaLogoUrl}
              alt="Logo Officiel Laila"
              className="w-[150px] sm:w-[175px] md:w-[200px] h-auto object-contain mx-auto mb-8 md:mb-10"
            />
            <span className="inline-block px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-8 backdrop-blur-sm">
              La Nouvelle Ère
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 font-display tracking-tight text-white drop-shadow-2xl">
              {latestAlbum?.title || "RÉSILIENCE"}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-red-50/90 mb-10 leading-relaxed font-light text-balance drop-shadow-md">
              Un voyage à travers le son et l'esprit. Découvrez la sortie
              premium très attendue de Laila, mêlant mélodies captivantes et
              émotion brute.
            </p>
            <div className="flex gap-4 justify-center w-full sm:w-auto">
              <PremiumButton
                size="lg"
                onClick={handleBuyAlbum}
                className="w-full sm:w-auto text-lg bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              >
                <Disc className="mr-2 h-5 w-5" />
                Acheter l'Album
              </PremiumButton>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="relative z-20 pb-12 pt-8 w-full text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-[0.4em] text-amber-500/80 uppercase drop-shadow-lg ml-[0.4em]">
            LAÏLA
          </h2>
        </motion.div>
      </section>

      <section className="py-24 bg-[#0a0a0a] relative border-t border-red-950/30 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-amber-900/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {!isAlbumLoading && latestAlbum && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative mx-auto w-full max-w-lg lg:max-w-none"
              >
                <div className="relative aspect-square rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(220,38,38,0.2)] ring-1 ring-white/10 group mb-5">
                  {latestIsResilience ? (
                    <VideoAssetDisplay
                      videoUrl={featuredVideoUrl as unknown as string}
                      posterUrl={featuredCoverUrl}
                      alt={`Pochette de l'album ${featuredTitle}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <ImageWithFallback
                      src={featuredCoverUrl}
                      alt={`Pochette de l'album ${featuredTitle}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-tr from-black/40 via-transparent to-white/5 pointer-events-none mix-blend-overlay" />
                </div>

                <div className="flex gap-3 mb-8">
                  <PremiumButton
                    size="sm"
                    onClick={handleBuyAlbum}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] border-none font-semibold"
                  >
                    <Disc className="mr-2 h-4 w-4" />
                    Acheter l'album
                  </PremiumButton>

                  {albumInCart ? (
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveAlbumFromCart}
                      className="border-green-800/50 bg-green-900/20 text-green-400 hover:bg-green-900/40 hover:text-green-300"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Dans le panier
                    </PremiumButton>
                  ) : (
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      onClick={handleAddAlbumToCart}
                      className="border-red-900/50 text-red-200 hover:bg-red-950/40"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Panier
                    </PremiumButton>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center lg:text-left lg:sticky lg:top-32"
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-amber-500/50" />
                  <span className="text-amber-500 font-medium tracking-[0.2em] uppercase text-sm">
                    Sortie en Vedette
                  </span>
                  <div className="w-8 h-px bg-amber-500/50 hidden lg:block" />
                </div>

                <h2 className="text-5xl md:text-7xl font-bold mb-2 font-display text-white tracking-tight drop-shadow-sm">
                  {featuredTitle.toUpperCase()}
                </h2>
                <p className="text-2xl md:text-3xl text-red-400 font-display italic mb-8">
                  par Laïla
                </p>

                <div className="w-16 h-1 bg-linear-to-r from-red-600 to-amber-500 mx-auto lg:mx-0 mb-8 rounded-full" />

                <p className="text-lg text-red-100/70 leading-relaxed mb-10 text-balance max-w-xl mx-auto lg:mx-0">
                  {featuredDescription}
                </p>
                <div className="flex flex-col gap-2 mb-10">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 text-center lg:text-left">
                      <p className="text-3xl font-bold text-white font-mono">
                        {latestAlbum.tracks.length}
                      </p>
                      <p className="text-sm text-red-200/50 mt-1">Titres</p>
                    </div>
                    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 text-center lg:text-left">
                      <p className="text-3xl font-bold text-amber-400 font-mono">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XAF",
                          maximumFractionDigits: 0,
                        }).format(
                          latestAlbum.tracks.reduce(
                            (sum, t) => sum + (t.price ?? 0),
                            0,
                          ),
                        )}
                      </p>
                      <p className="text-sm text-red-200/50 mt-1">Prix album</p>
                    </div>
                  </div>
                  {latestAlbum.tracks && latestAlbum.tracks.length > 0 && (
                    <div className="space-y-2">
                      {latestAlbum.tracks.map((track: Track, index: number) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
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
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to={`/album/$albumId`}
                    params={{ albumId: latestAlbum.id }}
                  >
                    <PremiumButton
                      size="lg"
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] group"
                    >
                      <Music className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                      Voir l'Album
                    </PremiumButton>
                  </Link>
                  <Link to="/music">
                    <PremiumButton
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto text-lg border-red-900/50 text-red-50 hover:bg-red-950/40"
                    >
                      Explorer Toute la Musique
                    </PremiumButton>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}

          <div className="mt-32 border-t border-red-950/30 pt-24">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white">
                Sorties en Vedette
              </h3>
              <div className="w-16 h-1 bg-linear-to-r from-red-600 to-amber-500 mx-auto rounded-full" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto mb-24"
            >
              <div className="relative rounded-[2rem] overflow-hidden bg-[#111]/80 backdrop-blur-sm border border-red-900/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-6 md:p-10 lg:p-12 group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-red-900/10 blur-[120px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:bg-red-900/20" />
                <div className="relative z-10 flex flex-col items-center text-center mb-8 md:mb-10">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Play className="w-3.5 h-3.5 mr-2 fill-amber-500" />
                    Nouveau Clip Officiel
                  </span>
                  <h4 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display text-white tracking-tight mb-4 drop-shadow-sm">
                    Pili Pili
                  </h4>
                  <p className="text-lg text-red-200/60 max-w-2xl text-balance">
                    Découvrez l'univers visuel de Pili Pili. Une immersion
                    captivante dans le son et l'image.
                  </p>
                </div>
                <div className="relative z-10 w-full aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.01]">
                  <iframe
                    className="w-full h-full bg-black"
                    src="https://www.youtube.com/embed/jFTU2eMUgZ4?rel=0&modestbranding=1"
                    title="Pili Pili - Laila"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </motion.div>

            <div className="text-center mb-12">
              <h4 className="text-2xl md:text-3xl font-bold mb-4 font-display text-white">
                Dans les Coulisses
              </h4>
              <p className="text-red-100/60 max-w-2xl mx-auto">
                Survolez les cartes pour révéler des images exclusives et
                inédites.
              </p>
            </div>

            {isExclusiveLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full aspect-3/4 rounded-2xl bg-red-950/20 animate-pulse"
                  />
                ))}
              </div>
            ) : exclusiveError ? (
              <div className="text-center text-red-400 py-12 bg-red-950/20 rounded-2xl border border-red-900/30">
                <p>{exclusiveError}</p>
              </div>
            ) : exclusiveGallery.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {exclusiveGallery.map((item: any) => (
                  <FlipCard
                    key={item.id}
                    title={item.title}
                    src={item.imageUrl}
                    mediaType={item.mediaType}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0d0d0d] relative border-t border-red-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white">
                À propos de Laila
              </h2>
              <div className="w-20 h-1 bg-red-600 mb-8 rounded-full" />
              <p className="text-lg text-red-100/60 leading-relaxed mb-8 text-balance">
                Une artiste indépendante créant des mélodies pleines d'âme et
                une musique intemporelle. Avec une passion pour raconter des
                histoires à travers le son, Laila crée des voyages émotionnels
                qui résonnent avec les auditeurs du monde entier.
              </p>
              <Link to="/music">
                <PremiumButton
                  variant="outline"
                  className="border-red-900/50 text-red-100 hover:bg-red-950/30"
                >
                  Découvrir le Son <ArrowRight className="ml-2 w-4 h-4" />
                </PremiumButton>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 h-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="col-span-1 pt-12 relative group"
              >
                <ImageWithFallback
                  src={aboutUrl1}
                  alt="Portrait premium de Laila"
                  className="w-full aspect-3/4 object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] ring-1 ring-white/5"
                />
              </motion.div>
              <div className="col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative group"
                >
                  <ImageWithFallback
                    src={aboutUrl2}
                    alt="Laila veste marron"
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] ring-1 ring-white/5"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="relative group"
                >
                  <ImageWithFallback
                    src={aboutUrl3}
                    alt="Laila effet halo"
                    className="w-full aspect-3/4 object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] ring-1 ring-white/5"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isPublicGalleryLoading && publicGallery.length > 0 && (
        <section className="py-24 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-white">
                Galerie en Vedette
              </h2>
              <p className="text-lg text-red-100/60">Un aperçu de l'art</p>
            </div>

            <div className="relative w-full max-w-5xl mx-auto aspect-4/5 sm:aspect-video md:aspect-2/1 rounded-3xl overflow-hidden shadow-2xl bg-[#0d0d0d] border border-red-950/30 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={galleryCarouselIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  {publicGallery[galleryCarouselIndex].mediaType === "VIDEO" ? (
                    <video
                      src={
                        resolveImg(publicGallery[galleryCarouselIndex]) ??
                        undefined
                      }
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <ImageWithFallback
                      src={
                        resolveImg(publicGallery[galleryCarouselIndex]) ??
                        undefined
                      }
                      alt={
                        publicGallery[galleryCarouselIndex].title ||
                        "Portrait en vedette"
                      }
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent flex flex-col justify-end p-8 sm:p-12">
                    <h3 className="text-2xl sm:text-4xl font-bold text-white font-display mb-2 drop-shadow-lg">
                      {publicGallery[galleryCarouselIndex].title}
                    </h3>
                    {publicGallery[galleryCarouselIndex].description && (
                      <p className="text-lg text-red-50/90 max-w-2xl drop-shadow-md">
                        {publicGallery[galleryCarouselIndex].description}
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {publicGallery.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 ring-1 ring-white/10"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 ring-1 ring-white/10"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {publicGallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {publicGallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryCarouselIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === galleryCarouselIndex ? "bg-white w-4" : "bg-white/30"}`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center mt-12">
              <Link to="/gallery">
                <PremiumButton
                  size="lg"
                  className="bg-red-950/40 border border-red-900/50 text-red-50 hover:bg-red-900/60"
                >
                  Voir toute la Galerie
                </PremiumButton>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-[#111] border-neutral-800 text-white max-w-md w-[95vw] rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90dvh]">
          {/* ── Header fixe ── */}
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-neutral-800 shrink-0">
            <DialogTitle className="text-xl font-bold text-white">
              Acheter {purchaseItem?.type === "track" ? "le Titre" : "l'Album"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400 mt-1 text-sm">
              <span className="block text-neutral-200 font-medium">
                {purchaseItem?.title}
              </span>
              Paiement sécurisé via Mobile Money ou carte bancaire.
            </DialogDescription>
          </DialogHeader>

          {/* ── Corps scrollable ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <PaymentForm
              amount={purchaseItem?.price ?? 0}
              albumId={purchaseItem?.albumId}
              trackId={purchaseItem?.trackId}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
