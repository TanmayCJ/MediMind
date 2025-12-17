import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VirtualPatient } from '@/types/patient';
import { 
  getPatientInitials, 
  formatDate,
  getStatusColor 
} from '@/lib/patientUtils';
import { Upload, FileText, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientHeaderProps {
  patient: VirtualPatient;
  onUploadClick: () => void;
}

export function PatientHeader({ patient, onUploadClick }: PatientHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/patients')}
        className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Button>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar with gradient ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-md opacity-50" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-3xl font-bold">
              {getPatientInitials(patient.patientName)}
            </div>
          </div>
          {/* Status indicator */}
          <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-card ${
            patient.latestStatus === 'completed' ? 'bg-green-500' :
            patient.latestStatus === 'processing' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
        </motion.div>

        {/* Patient Info */}
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent"
          >
            {patient.patientName}
          </motion.h1>
          
          {patient.patientId && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mt-1"
            >
              Patient ID: {patient.patientId}
            </motion.p>
          )}

          {/* Stat Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-3 mt-4"
          >
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3 text-sm bg-primary/10 border-primary/20">
              <FileText className="h-4 w-4" />
              {patient.reportCount} Reports
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3 text-sm bg-card">
              <Calendar className="h-4 w-4" />
              First: {formatDate(patient.firstVisit)}
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3 text-sm bg-card">
              <Clock className="h-4 w-4" />
              Last: {formatDate(patient.lastVisit)}
            </Badge>
            <Badge 
              variant="outline" 
              className={`py-1.5 px-3 text-sm capitalize ${getStatusColor(patient.latestStatus)}`}
            >
              {patient.latestStatus}
            </Badge>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <Button
            onClick={onUploadClick}
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload New Report
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
