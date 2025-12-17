import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-xl text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: [
          "h-10 px-3 py-2",
          "border border-input",
          "bg-background",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        glass: [
          "h-11 px-4 py-2",
          "bg-white/10 dark:bg-white/5",
          "backdrop-blur-md",
          "border border-white/20 dark:border-white/10",
          "focus:bg-white/15 dark:focus:bg-white/10",
          "focus:border-white/30 dark:focus:border-white/20",
          "focus:ring-2 focus:ring-primary/20",
          "shadow-sm",
        ],
        glassBold: [
          "h-12 px-4 py-3",
          "bg-white/15 dark:bg-white/10",
          "backdrop-blur-xl",
          "border border-white/30 dark:border-white/20",
          "focus:bg-white/20 dark:focus:bg-white/15",
          "focus:border-primary/50",
          "focus:ring-2 focus:ring-primary/30",
          "shadow-md",
        ],
        glassSubtle: [
          "h-10 px-3 py-2",
          "bg-white/5 dark:bg-white/[0.02]",
          "backdrop-blur-sm",
          "border border-white/10 dark:border-white/5",
          "focus:bg-white/10 dark:focus:bg-white/5",
          "focus:border-white/20",
        ],
      },
      inputSize: {
        default: "h-10",
        sm: "h-9 text-xs",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
