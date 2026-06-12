import { useState } from "react";
import { Check, Clock, ShoppingCart, Smartphone } from "lucide-react";
import PremiumButton from "../ui/premiem.button";
import PreviewPlayer from "../player/preview-player";
import type { Track } from "#/types/album";
import { formatDuration, formatXAF } from "#/lib/utils";

interface TrackCardProps {
  track: Track;
  index: number;
  onAddToCart: (track: Track) => void;
  onRemoveFromCart: (track: Track) => void;
  onBuyNow: (track: Track) => void;
  currentPlayingTrackId: string | null;
  onPlayStart: (trackId: string) => void;
  isInCart?: boolean;
}

const TrackCard = ({
  track,
  index,
  onAddToCart,
  onRemoveFromCart,
  onBuyNow,
  currentPlayingTrackId,
  onPlayStart,
  isInCart = false,
}: TrackCardProps) => {
  const previewUrl = track.previewUrl ?? null;
  const basePrice = track.price ?? 850;
  const priceDisplay = formatXAF(basePrice);

  const [realDuration, setRealDuration] = useState<number | null>(null);
  const formattedDuration = formatDuration(realDuration ?? track.duration);

  const featText =
    track.featuringArtists?.length > 0
      ? `ft. ${track.featuringArtists.join(", ")}`
      : "";

  const artistName = track.album?.title ?? "Laila";
  const displayArtist = [artistName, featText].filter(Boolean).join(" ");

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-md bg-[#0e0e0e] border border-neutral-800/60 hover:border-neutral-600/60 hover:bg-[#141414] transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
        <span className="text-neutral-600 font-display font-bold text-xl w-6 text-center group-hover:text-neutral-400 transition-colors hidden sm:block">
          {index}
        </span>

        <PreviewPlayer
          trackId={track.id}
          previewUrl={previewUrl}
          trackTitle={track.title}
          duration={track.duration ?? 0}
          currentPlayingTrackId={currentPlayingTrackId ?? ""}
          onPlayStart={onPlayStart}
          onDurationChange={setRealDuration}
        />

        <div className="truncate pr-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-neutral-600 font-display font-bold text-sm sm:hidden">
              {index}.
            </span>
            <p className="font-bold text-base sm:text-lg text-neutral-100 truncate group-hover:text-white transition-colors">
              {track.title}
            </p>
          </div>
          {displayArtist && (
            <p
              className="text-xs sm:text-sm text-neutral-500 truncate mt-0.5"
              title={displayArtist}
            >
              {displayArtist}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-600 font-mono">
            <Clock className="w-3 h-3" />
            <span>{formattedDuration}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 shrink-0">
        <PremiumButton
          size="sm"
          className="flex-1 sm:flex-none border-none bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          onClick={() => onBuyNow(track)}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Acheter • {priceDisplay}
        </PremiumButton>

        <PremiumButton
          variant="outline"
          size="sm"
          onClick={() =>
            isInCart ? onRemoveFromCart(track) : onAddToCart(track)
          }
          title={isInCart ? "Retirer du panier" : "Ajouter au panier"}
          className={`shrink-0 px-3 transition-all ${
            isInCart
              ? "border-green-800/40 bg-green-900/20 text-green-500 hover:bg-green-900/40 hover:text-green-400"
              : "border-neutral-700/60 text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
          }`}
        >
          {isInCart ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
        </PremiumButton>
      </div>
    </div>
  );
};

export default TrackCard;
