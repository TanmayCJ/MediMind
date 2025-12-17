import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyPatientStateProps {
  onUploadClick?: () => void;
}

export function EmptyPatientState({ onUploadClick }: EmptyPatientStateProps) {
  const navigate = useNavigate();

  const handleUpload = () => {
    if (onUploadClick) {
      onUploadClick();
    } else {
      navigate('/upload');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Animated icon composition */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <Users className="w-16 h-16 text-primary/60" />
          </motion.div>
        </div>
        
        {/* Floating icons */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 -right-2 p-2 rounded-full bg-accent/20 border border-accent/30"
        >
          <FileText className="w-5 h-5 text-accent" />
        </motion.div>
        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 -left-2 p-2 rounded-full bg-primary/20 border border-primary/30"
        >
          <Upload className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold mb-2"
      >
        No Patients Yet
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-md mb-8"
      >
        Upload your first diagnostic report to start building patient profiles. 
        Each report will automatically be organized under the patient's profile.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleUpload}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <Upload className="h-5 w-5" />
          Upload First Report
        </Button>
      </motion.div>
    </motion.div>
  );
}
