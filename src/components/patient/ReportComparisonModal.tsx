import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientReport, PatientReportSummary } from '@/types/patient';
import { compareFindings, formatDate, formatReportType } from '@/lib/patientUtils';
import { X, ArrowRight, Plus, Minus, Equal, FileText } from 'lucide-react';

interface ReportComparisonModalProps {
  report1: PatientReport;
  report2: PatientReport;
  summary1: PatientReportSummary | null;
  summary2: PatientReportSummary | null;
  onClose: () => void;
}

export function ReportComparisonModal({
  report1,
  report2,
  summary1,
  summary2,
  onClose,
}: ReportComparisonModalProps) {
  const [activeTab, setActiveTab] = useState('findings');

  const findingsDiff = compareFindings(
    summary1?.keyFindings || [],
    summary2?.keyFindings || []
  );

  const recommendationsDiff = compareFindings(
    summary1?.recommendations || [],
    summary2?.recommendations || []
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Report Comparison
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Report Headers */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-card/50 border border-border/50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatReportType(report1.reportType)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{formatDate(report1.uploadedAt)}</p>
              <p className="text-xs text-muted-foreground truncate">{report1.fileName}</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 col-start-2 row-start-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatReportType(report2.reportType)}</span>
                <Badge variant="outline" className="text-xs bg-primary/20 border-primary/30">Latest</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{formatDate(report2.uploadedAt)}</p>
              <p className="text-xs text-muted-foreground truncate">{report2.fileName}</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0 grid grid-cols-3 w-full">
            <TabsTrigger value="findings">Key Findings</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="summary">Full Summary</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="findings" className="m-0">
              <ComparisonSection
                title="Key Findings Comparison"
                diff={findingsDiff}
              />
            </TabsContent>

            <TabsContent value="recommendations" className="m-0">
              <ComparisonSection
                title="Recommendations Comparison"
                diff={recommendationsDiff}
              />
            </TabsContent>

            <TabsContent value="summary" className="m-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Previous Report</h4>
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50 text-sm whitespace-pre-wrap">
                    {summary1?.fullSummary || 'No summary available'}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Latest Report</h4>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm whitespace-pre-wrap">
                    {summary2?.fullSummary || 'No summary available'}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ComparisonSectionProps {
  title: string;
  diff: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };
}

function ComparisonSection({ title, diff }: ComparisonSectionProps) {
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border/50">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-green-500" />
          <span className="text-sm">{diff.added.length} New</span>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="h-4 w-4 text-red-500" />
          <span className="text-sm">{diff.removed.length} Resolved</span>
        </div>
        <div className="flex items-center gap-2">
          <Equal className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">{diff.unchanged.length} Unchanged</span>
        </div>
      </div>

      {/* New Items */}
      {diff.added.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-green-500 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New in Latest Report
          </h4>
          <div className="space-y-2">
            <AnimatePresence>
              {diff.added.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm"
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Removed Items */}
      {diff.removed.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-red-500 flex items-center gap-2">
            <Minus className="h-4 w-4" />
            Resolved / Removed
          </h4>
          <div className="space-y-2">
            <AnimatePresence>
              {diff.removed.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm line-through opacity-70"
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Unchanged Items */}
      {diff.unchanged.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-yellow-500 flex items-center gap-2">
            <Equal className="h-4 w-4" />
            Unchanged
          </h4>
          <div className="space-y-2">
            <AnimatePresence>
              {diff.unchanged.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm"
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {diff.added.length === 0 && diff.removed.length === 0 && diff.unchanged.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No data available for comparison
        </div>
      )}
    </div>
  );
}
