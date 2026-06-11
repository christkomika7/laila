import ImageWithFallback from "@/components/ui/image-with-fallback.jsx";

interface FlipCardProps {
  src?: string;
  mediaType?: "IMAGE" | "VIDEO";
  title?: string;
}

const FlipCard = ({ src, mediaType, title }: FlipCardProps) => {
  return (
    <div className="group perspective-1000 w-full aspect-3/4 cursor-pointer">
      <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180 shadow-2xl shadow-red-900/20 rounded-2xl">
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden bg-card border border-white/10">
          {mediaType === "VIDEO" && src ? (
            <video
              src={src}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : src ? (
            <ImageWithFallback
              src={src}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
            <h3 className="text-xl font-display font-bold text-white drop-shadow-md">
              {title}
            </h3>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden bg-card border border-secondary/30">
          <div className="w-full h-full flex items-center justify-center bg-muted" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
            <div className="w-full text-center">
              <span className="inline-block px-3 py-1 rounded-full border border-secondary/50 bg-secondary/10 text-secondary text-xs font-medium tracking-widest uppercase backdrop-blur-sm">
                Exclusive
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
