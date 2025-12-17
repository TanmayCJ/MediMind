import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PatientReport } from '@/types/patient';
import { 
  formatDate, 
  formatReportType, 
  getReportTypeColor,
  getReportTypeIcon 
} from '@/lib/patientUtils';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface HealthJourneyTimelineProps {
  reports: PatientReport[];
}

export function HealthJourneyTimeline({ reports }: HealthJourneyTimelineProps) {
  // Sort by date (oldest first)
  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
    );
  }, [reports]);

  // Extract progression data
  const progressionData = useMemo(() => {
    return sortedReports.map((report, index) => {
      const prevReport = index > 0 ? sortedReports[index - 1] : null;
      const currentFindings = report.summary?.keyFindings?.length || 0;
      const prevFindings = prevReport?.summary?.keyFindings?.length || 0;
      
      let trend: 'improving' | 'stable' | 'attention' = 'stable';
      if (index > 0) {
        if (currentFindings < prevFindings) trend = 'improving';
        else if (currentFindings > prevFindings) trend = 'attention';
      }

      return {
        ...report,
        trend,
        findingsCount: currentFindings,
        recommendationsCount: report.summary?.recommendations?.length || 0,
      };
    });
  }, [sortedReports]);

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No reports available for journey visualization
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <Card className="backdrop-blur-sm bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Health Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Horizontal scrollable timeline */}
          <div className="relative overflow-x-auto pb-4">
            <div className="flex items-start gap-4 min-w-max">
              {progressionData.map((report, index) => {
                const Icon = getReportTypeIcon(report.reportType);
                const isFirst = index === 0;
                const isLast = index === progressionData.length - 1;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex flex-col items-center"
                    style={{ minWidth: '180px' }}
                  >
                    {/* Connecting line */}
                    {!isLast && (
                      <div 
                        className="absolute top-8 left-1/2 w-full h-0.5"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))`,
                        }}
                      />
                    )}

                    {/* Node */}
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                      isFirst 
                        ? 'bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50' 
                        : isLast 
                        ? 'bg-gradient-to-br from-accent to-primary'
                        : 'bg-card border-2 border-primary/30'
                    }`}>
                      <Icon className={`h-6 w-6 ${isLast ? 'text-white' : getReportTypeColor(report.reportType).split(' ')[1]}`} />
                    </div>

                    {/* Trend indicator */}
                    {!isFirst && (
                      <div className={`absolute top-0 right-8 p-1 rounded-full ${
                        report.trend === 'improving' ? 'bg-green-500/20' :
                        report.trend === 'attention' ? 'bg-yellow-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        {report.trend === 'improving' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : report.trend === 'attention' ? (
                          <TrendingDown className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Minus className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                    )}

                    {/* Content card */}
                    <div className="mt-4 p-3 rounded-lg bg-card/80 border border-border/50 w-full text-center">
                      <Badge 
                        variant="outline" 
                        className={`text-xs mb-2 ${getReportTypeColor(report.reportType)}`}
                      >
                        {formatReportType(report.reportType)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDate(report.uploadedAt)}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-primary">{report.findingsCount} findings</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-accent">{report.recommendationsCount} recs</span>
                      </div>
                      
                      {/* First key finding preview */}
                      {report.summary?.keyFindings?.[0] && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {report.summary.keyFindings[0]}
                        </p>
                      )}
                    </div>

                    {/* Date marker */}
                    {isFirst && (
                      <div className="mt-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs text-primary">
                        Start
                      </div>
                    )}
                    {isLast && (
                      <div className="mt-2 px-2 py-0.5 rounded-full bg-accent/20 text-xs text-accent">
                        Latest
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="p-1 rounded-full bg-green-500/20">
                <TrendingUp className="h-3 w-3 text-green-500" />
              </div>
              <span>Improving</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="p-1 rounded-full bg-gray-500/20">
                <Minus className="h-3 w-3 text-gray-500" />
              </div>
              <span>Stable</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="p-1 rounded-full bg-yellow-500/20">
                <TrendingDown className="h-3 w-3 text-yellow-500" />
              </div>
              <span>Needs Attention</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
