import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Glass variants - light/dark adaptive
        glass: [
          "bg-black/[0.04] dark:bg-white/[0.08]",
          "backdrop-blur-xl",
          "border border-black/[0.08] dark:border-white/[0.15]",
          "text-slate-600 dark:text-white/80",
          "hover:bg-black/[0.08] dark:hover:bg-white/[0.12]",
          "hover:border-black/[0.12] dark:hover:border-white/[0.2]",
          "hover:text-slate-800 dark:hover:text-white",
        ],
        glassPrimary: [
          "bg-sky-500/[0.1]",
          "backdrop-blur-xl",
          "border border-sky-500/[0.2] dark:border-sky-400/[0.2]",
          "text-sky-600 dark:text-sky-400",
          "hover:bg-sky-500/[0.15]",
          "hover:border-sky-500/[0.3] dark:hover:border-sky-400/[0.3]",
          "shadow-[0_0_20px_-5px_rgba(56,189,248,0.2)]",
        ],
        glassAccent: [
          "bg-accent/20",
          "backdrop-blur-md",
          "border border-accent/30",
          "text-accent",
          "hover:bg-accent/30",
          "hover:border-accent/50",
          "shadow-[0_4px_16px_-4px_hsl(var(--accent)/0.3)]",
        ],
        glassSuccess: [
          "bg-green-500/20",
          "backdrop-blur-md",
          "border border-green-500/30",
          "text-green-600 dark:text-green-400",
          "hover:bg-green-500/30",
          "hover:border-green-500/50",
        ],
        glassDestructive: [
          "bg-destructive/20",
          "backdrop-blur-md",
          "border border-destructive/30",
          "text-destructive",
          "hover:bg-destructive/30",
          "hover:border-destructive/50",
        ],
        
        // Solid glass with gradient
        glassSolid: [
          "bg-gradient-to-r from-primary to-accent",
          "text-white",
          "shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]",
          "hover:shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.5)]",
          "hover:scale-[1.02]",
          "active:scale-[0.98]",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
