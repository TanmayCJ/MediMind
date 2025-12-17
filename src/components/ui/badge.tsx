import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Glass variants
        glass: [
          "bg-white/10 dark:bg-white/5",
          "backdrop-blur-sm",
          "border-white/20 dark:border-white/10",
          "text-foreground",
        ],
        glassPrimary: [
          "bg-primary/15",
          "backdrop-blur-sm",
          "border-primary/30",
          "text-primary",
        ],
        glassAccent: [
          "bg-accent/15",
          "backdrop-blur-sm",
          "border-accent/30",
          "text-accent",
        ],
        glassSuccess: [
          "bg-green-500/15",
          "backdrop-blur-sm",
          "border-green-500/30",
          "text-green-600 dark:text-green-400",
        ],
        glassWarning: [
          "bg-amber-500/15",
          "backdrop-blur-sm",
          "border-amber-500/30",
          "text-amber-600 dark:text-amber-400",
        ],
        glassDestructive: [
          "bg-destructive/15",
          "backdrop-blur-sm",
          "border-destructive/30",
          "text-destructive",
        ],
        glassInfo: [
          "bg-blue-500/15",
          "backdrop-blur-sm",
          "border-blue-500/30",
          "text-blue-600 dark:text-blue-400",
        ],
        
        // Gradient glass
        glassGradient: [
          "bg-gradient-to-r from-primary/15 to-accent/15",
          "backdrop-blur-sm",
          "border-white/20",
          "text-foreground",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
