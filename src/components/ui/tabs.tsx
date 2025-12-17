import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "glass" | "glassPill";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center text-muted-foreground",
      variant === "default" && "h-10 rounded-md bg-muted p-1",
      variant === "glass" && [
        "h-11 rounded-xl p-1",
        "bg-white/10 dark:bg-white/5",
        "backdrop-blur-md",
        "border border-white/20 dark:border-white/10",
        "shadow-sm",
      ],
      variant === "glassPill" && [
        "h-12 rounded-full p-1.5",
        "bg-white/15 dark:bg-white/10",
        "backdrop-blur-xl",
        "border border-white/30 dark:border-white/15",
        "shadow-md",
      ],
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "glass" | "glassPill";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && [
        "rounded-sm px-3 py-1.5",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      ],
      variant === "glass" && [
        "rounded-lg px-4 py-2",
        "data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/15",
        "data-[state=active]:text-foreground",
        "data-[state=active]:shadow-sm",
        "data-[state=active]:backdrop-blur-sm",
        "hover:bg-white/10 dark:hover:bg-white/5",
      ],
      variant === "glassPill" && [
        "rounded-full px-5 py-2",
        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-accent/80",
        "data-[state=active]:text-white",
        "data-[state=active]:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.4)]",
        "hover:bg-white/10 dark:hover:bg-white/5",
      ],
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // Subtle fade-in animation
      "data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:duration-300",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
