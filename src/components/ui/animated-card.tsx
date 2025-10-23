import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ 
  children, 
  title, 
  description, 
  className,
  delay = 0,
  hover = true 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
    >
      <Card className={cn(
        "backdrop-blur-sm bg-card/50 border-glass-border shadow-md hover:shadow-lg transition-shadow",
        className
      )}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        {children && <CardContent>{children}</CardContent>}
      </Card>
    </motion.div>
  );
}
