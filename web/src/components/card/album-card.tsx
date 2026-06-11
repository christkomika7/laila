import { Link } from "@tanstack/react-router";
import PremiumCard from "./premium-card";
import ImageWithFallback from "../ui/image-with-fallback";
import PremiumButton from "../ui/premiem.button";
import { Check, Disc3, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "#/store/use-cart-store";
import type { Album } from "#/types/album";

interface AlbumCardProps {
  album: Album;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600";

export const AlbumCard = ({ album }: AlbumCardProps) => {
  const items = useCartStore.use.items();
  const addAlbum = useCartStore.use.addAlbum();
  const removeItem = useCartStore.use.removeItem();

  const cartKey = `album:${album.id}`;
  const albumInCart = items.some((i) => i.id === cartKey);

  const releaseYear = new Date(album.releaseDate).getFullYear();

  const totalPrice = album.tracks.reduce((sum, t) => sum + t.price, 0);
  const priceDisplay = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (albumInCart) return;
    addAlbum(album);
    toast.success(`« ${album.title} » ajouté au panier`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(cartKey);
    toast.info(`« ${album.title} » retiré du panier`);
  };

  const coverUrl = album.coverUrl ?? FALLBACK_IMAGE;

  return (
    <PremiumCard className="flex flex-col h-full group">
      <Link
        to="/album/$albumId"
        params={{ albumId: album.id }}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden">
          <ImageWithFallback
            src={coverUrl}
            alt={`Cover art for ${album.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm shadow bg-primary/80 text-primary-foreground border border-primary/60">
            <Disc3 className="w-3 h-3" />
            Album
          </span>
          {albumInCart && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow bg-green-600/90 text-white border border-green-500/60">
              <Check className="w-3 h-3" />
              Dans le panier
            </span>
          )}
        </div>
      </Link>

      <div className="p-6 flex flex-col grow">
        <Link to="/album/$albumId" params={{ albumId: album.id }}>
          <h3 className="text-xl font-bold mb-1 line-clamp-1 hover:text-primary transition-colors">
            {album.title}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm mb-1">
          Laila • {releaseYear} • {album.tracks.length} titre
          {album.tracks.length > 1 ? "s" : ""}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-primary whitespace-nowrap">
            {totalPrice > 0 ? priceDisplay : "Gratuit"}
          </span>

          {albumInCart ? (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-sm text-green-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Ajouté
              </span>
              <button
                onClick={handleRemove}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-600/60 bg-red-950/30 hover:bg-red-900/30 px-2.5 py-1.5 rounded-lg transition-all"
              >
                <X className="w-3 h-3" />
                Retirer
              </button>
            </div>
          ) : (
            <PremiumButton
              size="sm"
              onClick={handleAddToCart}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter au panier
            </PremiumButton>
          )}
        </div>
      </div>
    </PremiumCard>
  );
};
