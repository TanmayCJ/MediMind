import { motion } from 'framer-motion';
import { PatientReport } from '@/types/patient';
import { 
  formatDate, 
  formatReportType, 
  getReportTypeColor,
  getReportTypeIcon 
} from '@/lib/patientUtils';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface PatientTimelineProps {
  reports: PatientReport[];
}

export function PatientTimeline({ reports }: PatientTimelineProps) {
  const navigate = useNavigate();

  // Sort by date (oldest first for timeline)
  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
  );

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/20" />

      <div className="space-y-6">
        {sortedReports.map((report, index) => {
          const Icon = getReportTypeIcon(report.reportType);
          const isLast = index === sortedReports.length - 1;
          const keyFinding = report.summary?.keyFindings?.[0];

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative pl-14"
            >
              {/* Timeline node */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className={`absolute left-3 w-6 h-6 rounded-full flex items-center justify-center ${
                  isLast 
                    ? 'bg-gradient-to-br from-primary to-accent' 
                    : 'bg-card border-2 border-primary/50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isLast ? 'bg-white' : 'bg-primary'}`} />
              </motion.div>

              {/* Content card */}
              <motion.div
                whileHover={{ x: 4, scale: 1.01 }}
                onClick={() => navigate(`/summary/${report.id}`)}
                className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 cursor-pointer hover:bg-accent/10 hover:border-primary/30 transition-all group"
              >
                {/* Date badge */}
                <div className="absolute -top-2 left-4">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {formatDate(report.uploadedAt)}
                  </span>
                </div>

                <div className="flex items-start gap-4 mt-2">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${getReportTypeColor(report.reportType).split(' ')[0]}`}>
                    <Icon className={`h-5 w-5 ${getReportTypeColor(report.reportType).split(' ')[1]}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{formatReportType(report.reportType)} Report</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        report.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">{report.fileName}</p>
                    
                    {keyFinding && (
                      <div className="mt-2 p-2 bg-accent/20 rounded-md">
                        <p className="text-xs text-muted-foreground">Key Finding:</p>
                        <p className="text-sm">{keyFinding}</p>
                      </div>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
