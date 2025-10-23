import { motion } from "framer-motion";
import { Card, CardContent } from "./card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  delay?: number;
  gradient?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, delay = 0, gradient = false }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-sm border-glass-border",
        gradient && "bg-gradient-to-br from-primary/10 to-accent/10"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <motion.p 
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
              >
                {value}
              </motion.p>
              {trend && (
                <motion.p 
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.3 }}
                >
                  {trend}
                </motion.p>
              )}
            </div>
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: delay + 0.1, type: "spring" }}
              className="p-3 rounded-full bg-primary/10"
            >
              <Icon className="h-6 w-6 text-primary" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
