import React from "react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    { className, variant = "primary", size = "default", children, ...props },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20",
      outline:
        "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      ghost: "hover:bg-muted text-foreground",
    };

    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 px-4 text-sm",
      lg: "h-14 px-8 text-lg",
      icon: "h-11 w-11 flex items-center justify-center rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-premium active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

PremiumButton.displayName = "PremiumButton";

export default PremiumButton;
