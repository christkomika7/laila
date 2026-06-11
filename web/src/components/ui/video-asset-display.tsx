import ImageWithFallback from "@/components/ui/image-with-fallback.jsx";

interface VideoAssetDisplayProps {
  videoUrl: string;
  posterUrl: string;
  alt?: string;
  className?: string;
}

const VideoAssetDisplay = ({
  videoUrl,
  posterUrl,
  alt,
  className,
}: VideoAssetDisplayProps) => {
  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        loop
        muted
        playsInline
        className={className}
      />
    );
  }

  return (
    <ImageWithFallback
      src={posterUrl}
      alt={alt || "Media"}
      className={className}
    />
  );
};

export default VideoAssetDisplay;
