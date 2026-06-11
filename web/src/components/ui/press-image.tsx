import { Skeleton } from "./skeleton";

interface PressImageProps {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  containerClass?: string;
  isLoading?: boolean;
}

export const PressImage = ({
  src,
  alt,
  caption,
  className = "aspect-square",
  containerClass = "",
  isLoading = false,
}: PressImageProps) => (
  <div className={`flex flex-col ${containerClass}`}>
    {isLoading ? (
      <Skeleton className={`pb-image-wrapper w-full ${className}`} />
    ) : (
      <div className={`pb-image-wrapper group ${className}`}>
        <img src={src} alt={alt} className="pb-image" loading="lazy" />
      </div>
    )}
    {caption &&
      (isLoading ? (
        <Skeleton className="h-4 w-2/3 mx-auto mt-4" />
      ) : (
        <p className="pb-caption">{caption}</p>
      ))}
  </div>
);
