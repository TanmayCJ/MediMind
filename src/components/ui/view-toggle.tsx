import { motion } from 'framer-motion';
import { User, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type ViewMode = 'patient' | 'doctor';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const STORAGE_KEY = 'medimind-view-preference';

export function useViewPreference(): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'patient' || stored === 'doctor') {
        return stored;
      }
    }
    return 'patient'; // Default to patient view
  });

  const setAndStoreViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  return [viewMode, setAndStoreViewMode];
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground mr-2">View as:</span>
      <div className="relative flex items-center bg-muted rounded-full p-1 gap-1">
        {/* Patient View Button */}
        <button
          onClick={() => onChange('patient')}
          className={cn(
            "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
            value === 'patient' 
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <User className="h-4 w-4" />
          <span>Patient</span>
        </button>
        
        {/* Doctor View Button */}
        <button
          onClick={() => onChange('doctor')}
          className={cn(
            "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
            value === 'doctor' 
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <Stethoscope className="h-4 w-4" />
          <span>Doctor</span>
        </button>
      </div>
    </div>
  );
}

// Compact version for mobile
export function ViewToggleCompact({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative flex items-center bg-muted rounded-lg p-0.5">
        <motion.div
          className={cn(
            "absolute h-7 w-7 rounded-md",
            value === 'patient' 
              ? "bg-gradient-to-r from-blue-500 to-cyan-500" 
              : "bg-gradient-to-r from-purple-600 to-indigo-600"
          )}
          initial={false}
          animate={{
            x: value === 'patient' ? 0 : '100%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        <button
          onClick={() => onChange('patient')}
          className={cn(
            "relative z-10 p-1.5 rounded-md transition-colors duration-200",
            value === 'patient' ? "text-white" : "text-muted-foreground"
          )}
          title="Patient View"
        >
          <User className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onChange('doctor')}
          className={cn(
            "relative z-10 p-1.5 rounded-md transition-colors duration-200",
            value === 'doctor' ? "text-white" : "text-muted-foreground"
          )}
          title="Doctor View"
        >
          <Stethoscope className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// View mode indicator badge
export function ViewModeBadge({ mode }: { mode: ViewMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        mode === 'patient'
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      )}
    >
      {mode === 'patient' ? (
        <>
          <User className="h-3 w-3" />
          Patient View
        </>
      ) : (
        <>
          <Stethoscope className="h-3 w-3" />
          Doctor View
        </>
      )}
    </motion.div>
  );
}
