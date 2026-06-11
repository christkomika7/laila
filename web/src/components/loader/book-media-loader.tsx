import { useState, useEffect, useRef } from "react";
import { Loader2, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

interface BookMediaLoaderProps {
  src: string | null;
  type: "video" | "image";
  alt: string;
  className?: string;
  preload?: boolean;
}

const BookMediaLoader = ({
  src,
  type,
  alt,
  className = "",
  preload = false,
}: BookMediaLoaderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(preload);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (preload) {
      setIsInView(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [preload]);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const ErrorIcon = type === "video" ? VideoIcon : ImageIcon;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden h-full bg-muted/20 ${className}`}
    >
      {!isLoaded && !hasError && src && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 backdrop-blur-sm z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin opacity-50" />
        </div>
      )}

      {hasError || !src ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground gap-2">
          <ErrorIcon className="w-12 h-12 opacity-20" />
          <span className="text-sm font-medium">
            {!src ? "Aucun média" : "Média indisponible"}
          </span>
        </div>
      ) : isInView ? (
        type === "video" ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <img
            src={src}
            alt={alt || "Gallery image"}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )
      ) : null}
    </div>
  );
};

export default BookMediaLoader;
