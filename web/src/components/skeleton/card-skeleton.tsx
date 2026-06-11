import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  [key: string]: any;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <Skeleton className="h-[250px] w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
);

export const PortraitSkeleton = () => (
  <Skeleton className="aspect-3/4 w-full rounded-xl" />
);

export default Skeleton;
