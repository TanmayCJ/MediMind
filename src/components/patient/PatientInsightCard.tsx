import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface PatientInsightCardProps {
  title: string;
  insights: string[];
  icon: LucideIcon;
  variant?: 'info' | 'warning' | 'success';
}

export function PatientInsightCard({ 
  title, 
  insights, 
  icon: Icon, 
  variant = 'info' 
}: PatientInsightCardProps) {
  const variantStyles = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-500',
      text: 'text-blue-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-500',
      text: 'text-yellow-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]',
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      icon: 'text-green-500',
      text: 'text-green-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]',
    },
  };

  const styles = variantStyles[variant];

  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className={`${styles.bg} ${styles.border} ${styles.glow} border backdrop-blur-md transition-all duration-300`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg flex items-center gap-2 ${styles.text}`}>
            <Icon className={`h-5 w-5 ${styles.icon}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.slice(0, 5).map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${styles.icon.replace('text-', 'bg-')}`} />
                <span className="capitalize">{insight}</span>
              </motion.li>
            ))}
            {insights.length > 5 && (
              <li className="text-sm text-muted-foreground">
                +{insights.length - 5} more...
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
