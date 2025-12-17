import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PatientReport } from '@/types/patient';
import { 
  formatDate, 
  getReportTypeColor, 
  formatReportType,
  getStatusColor,
  getReportTypeIcon
} from '@/lib/patientUtils';
import { Eye, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientReportCardProps {
  report: PatientReport;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  index?: number;
}

export function PatientReportCard({ 
  report, 
  selectable = false, 
  selected = false, 
  onSelect,
  index = 0 
}: PatientReportCardProps) {
  const navigate = useNavigate();
  const Icon = getReportTypeIcon(report.reportType);
  const keyFinding = report.summary?.keyFindings?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 4, scale: 1.01 }}
      className={`relative flex items-center gap-4 p-4 rounded-lg border transition-all ${
        selected 
          ? 'bg-primary/10 border-primary/50' 
          : 'bg-card/50 border-border/50 hover:bg-accent/10 hover:border-border'
      }`}
    >
      {/* Selection checkbox */}
      {selectable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className="flex-shrink-0"
        >
          {selected ? (
            <CheckSquare className="h-5 w-5 text-primary" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </button>
      )}

      {/* Report Type Icon */}
      <div className={`flex-shrink-0 p-2.5 rounded-lg ${getReportTypeColor(report.reportType).replace('text-', 'bg-').replace(/text-\w+-\d+/, '').split(' ')[0]}`}>
        <Icon className={`h-5 w-5 ${getReportTypeColor(report.reportType).split(' ')[1]}`} />
      </div>

      {/* Report Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={`text-xs ${getReportTypeColor(report.reportType)}`}>
            {formatReportType(report.reportType)}
          </Badge>
          <Badge variant="outline" className={`text-xs ${getStatusColor(report.status)}`}>
            {report.status}
          </Badge>
        </div>
        <p className="text-sm font-medium truncate">{report.fileName}</p>
        {keyFinding && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {keyFinding}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm text-muted-foreground">{formatDate(report.uploadedAt)}</p>
      </div>

      {/* View Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/summary/${report.id}`);
        }}
        className="flex-shrink-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
