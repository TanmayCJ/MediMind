import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-sm",
        // Pure glass - like the reference image, works in light and dark
        glass: [
          "bg-white/70 dark:bg-white/[0.08]",
          "backdrop-blur-2xl",
          "border border-black/[0.08] dark:border-white/[0.15]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        ],
        // Even more transparent
        glassSubtle: [
          "bg-white/50 dark:bg-white/[0.04]",
          "backdrop-blur-xl",
          "border border-black/[0.05] dark:border-white/[0.08]",
        ],
        // More visible glass
        glassBold: [
          "bg-white/80 dark:bg-white/[0.12]",
          "backdrop-blur-2xl",
          "border border-black/[0.1] dark:border-white/[0.2]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]",
        ],
        // With inner glow at top
        glassShine: [
          "relative bg-white/70 dark:bg-white/[0.08]",
          "backdrop-blur-2xl",
          "border border-black/[0.08] dark:border-white/[0.15]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-black/10 dark:before:via-white/30 before:to-transparent before:rounded-t-2xl",
        ],
        // Colored variants
        glassPrimary: [
          "bg-sky-100/70 dark:bg-sky-500/[0.08]",
          "backdrop-blur-2xl",
          "border border-sky-300/30 dark:border-sky-400/20",
          "shadow-[0_8px_32px_rgba(56,189,248,0.06)] dark:shadow-[0_8px_32px_rgba(56,189,248,0.1)]",
        ],
        glassAccent: [
          "bg-cyan-100/70 dark:bg-cyan-500/[0.08]",
          "backdrop-blur-2xl",
          "border border-cyan-300/30 dark:border-cyan-400/20",
          "shadow-[0_8px_32px_rgba(34,211,238,0.06)] dark:shadow-[0_8px_32px_rgba(34,211,238,0.1)]",
        ],
        glassSuccess: [
          "bg-emerald-100/70 dark:bg-emerald-500/[0.08]",
          "backdrop-blur-2xl",
          "border border-emerald-300/30 dark:border-emerald-400/20",
        ],
        glassWarning: [
          "bg-amber-100/70 dark:bg-amber-500/[0.08]",
          "backdrop-blur-2xl",
          "border border-amber-300/30 dark:border-amber-400/20",
        ],
        glassDanger: [
          "bg-red-100/70 dark:bg-red-500/[0.08]",
          "backdrop-blur-2xl",
          "border border-red-300/30 dark:border-red-400/20",
        ],
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)]",
        glow: "hover:shadow-[0_0_32px_rgba(56,189,248,0.1)] dark:hover:shadow-[0_0_32px_rgba(56,189,248,0.15)]",
        scale: "hover:scale-[1.02]",
        border: "hover:border-black/15 dark:hover:border-white/25",
        bright: "hover:bg-white/80 dark:hover:bg-white/[0.12] hover:border-black/10 dark:hover:border-white/20",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
