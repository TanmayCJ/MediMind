import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { VirtualPatient } from '@/types/patient';
import { 
  getPatientInitials, 
  formatRelativeTime, 
  getReportTypeColor,
  formatReportType 
} from '@/lib/patientUtils';
import { FileText, Calendar, Clock } from 'lucide-react';

interface PatientCardProps {
  patient: VirtualPatient;
  onClick: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const displayTypes = patient.reportTypes.slice(0, 3);
  const remainingCount = patient.reportTypes.length - 3;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="relative backdrop-blur-xl bg-card/40 border-primary/10 shadow-xl hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden group"
        onClick={onClick}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 animate-gradient-x" />
          <div className="absolute inset-[1px] rounded-xl bg-card" />
        </div>

        <div className="relative p-5 space-y-4">
          {/* Header with Avatar */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white shadow-lg">
                {getPatientInitials(patient.patientName)}
              </div>
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                patient.latestStatus === 'completed' ? 'bg-green-500' :
                patient.latestStatus === 'processing' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`} />
            </div>

            {/* Name and ID */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {patient.patientName}
              </h3>
              {patient.patientId && (
                <p className="text-sm text-muted-foreground truncate">
                  ID: {patient.patientId}
                </p>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{patient.reportCount}</span>
              <span>reports</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatRelativeTime(patient.lastVisit)}</span>
            </div>
          </div>

          {/* Report Type Badges */}
          <div className="flex flex-wrap gap-2">
            {displayTypes.map((type) => (
              <Badge
                key={type}
                variant="outline"
                className={`text-xs ${getReportTypeColor(type)}`}
              >
                {formatReportType(type)}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/50">
                +{remainingCount} more
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>First visit: {new Date(patient.firstVisit).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
