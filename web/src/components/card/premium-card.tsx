import React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
}

const PremiumCard = React.forwardRef(
  ({ className, children, hover = true, ...props }: PremiumCardProps) => {
    return (
      <div
        ref={props.ref}
        className={cn(
          "bg-card border border-border rounded-2xl overflow-hidden",
          hover &&
            "transition-premium hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

PremiumCard.displayName = "PremiumCard";

export default PremiumCard;
