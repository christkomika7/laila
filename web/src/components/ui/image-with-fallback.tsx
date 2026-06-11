import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  [key: string]: any;
}

const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackClassName,
  ...props
}: Props) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
          fallbackClassName,
        )}
      >
        <ImageIcon className="w-1/3 h-1/3 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Image"}
      className={cn(
        "transition-premium",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default ImageWithFallback;
