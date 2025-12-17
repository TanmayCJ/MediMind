import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientProfile, useReportComparison } from '@/hooks/usePatients';
import {
  PatientHeader,
  PatientReportCard,
  PatientTimeline,
  PatientMetricsChart,
  HealthJourneyTimeline,
  PatientInsightCard,
  ReportComparisonModal,
} from '@/components/patient';
import {
  extractInsightsFromSummaries,
  formatReportType,
  getReportTypeColor,
} from '@/lib/patientUtils';
import {
  LayoutDashboard,
  FileText,
  Clock,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  GitCompare,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PatientProfile() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patient, loading, error } = usePatientProfile(patientId);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Comparison data
  const { comparison } = useReportComparison(
    selectedReports[0] || null,
    selectedReports[1] || null
  );

  // Extract insights from patient reports
  const insights = useMemo(() => {
    if (!patient) return null;
    return extractInsightsFromSummaries(patient.reports);
  }, [patient]);

  // Report type distribution for pie chart
  const reportTypeDistribution = useMemo(() => {
    if (!patient) return [];
    const distribution: Record<string, number> = {};
    patient.reports.forEach((r) => {
      distribution[r.reportType] = (distribution[r.reportType] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({
      name: formatReportType(name),
      value,
    }));
  }, [patient]);

  // Handle report selection for comparison
  const toggleReportSelection = (reportId: string) => {
    setSelectedReports((prev) => {
      if (prev.includes(reportId)) {
        return prev.filter((id) => id !== reportId);
      }
      if (prev.length < 2) {
        return [...prev, reportId];
      }
      // Replace oldest selection
      return [prev[1], reportId];
    });
  };

  const handleUploadClick = () => {
    // Navigate to upload with patient pre-filled
    navigate('/upload', { 
      state: { 
        patientName: patient?.patientName,
        patientId: patient?.patientId 
      } 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Patient Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'The patient you are looking for does not exist.'}
          </p>
          <Button onClick={() => navigate('/patients')}>
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />

      <div className="container mx-auto px-6 py-8 space-y-8 max-w-7xl relative z-10">
        {/* Patient Header */}
        <PatientHeader patient={patient} onUploadClick={handleUploadClick} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList variant="glass" className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger variant="glass" value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger variant="glass" value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger variant="glass" value="timeline" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger variant="glass" value="trends" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Trends</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {insights && insights.recurringFindings.length > 0 && (
                  <PatientInsightCard
                    title="Recurring Findings"
                    insights={insights.recurringFindings}
                    icon={AlertTriangle}
                    variant="warning"
                  />
                )}
                
                {insights && insights.commonRecommendations.length > 0 && (
                  <PatientInsightCard
                    title="Common Recommendations"
                    insights={insights.commonRecommendations}
                    icon={Lightbulb}
                    variant="info"
                  />
                )}

                {/* Latest report key findings */}
                {patient.reports[0]?.summary?.keyFindings && patient.reports[0].summary.keyFindings.length > 0 && (
                  <PatientInsightCard
                    title="Latest Findings"
                    insights={patient.reports[0].summary.keyFindings}
                    icon={CheckCircle}
                    variant="success"
                  />
                )}
              </motion.div>

              {/* Report Type Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
              <Card variant="glass" hover="lift" className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Report Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportTypeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {reportTypeDistribution.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {reportTypeDistribution.map((entry, index) => (
                        <Badge
                          key={entry.name}
                          variant="outline"
                          className="gap-1"
                          style={{ borderColor: COLORS[index % COLORS.length] }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {entry.name}: {entry.value}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Reports */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass" hover="lift">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Reports</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('reports')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {patient.reports.slice(0, 3).map((report, index) => (
                    <PatientReportCard
                      key={report.id}
                      report={report}
                      index={index}
                    />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Comparison Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10"
            >
              <div className="flex items-center gap-4">
                <GitCompare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Compare Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Select 2 reports to compare findings and recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedReports.length}/2 selected
                </span>
                {selectedReports.length === 2 && (
                  <Button
                    onClick={() => setShowComparison(true)}
                    className="gap-2"
                  >
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </Button>
                )}
                {selectedReports.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReports([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Reports List */}
            <Card variant="glass" hover="lift">
              <CardHeader>
                <CardTitle>All Reports ({patient.reports.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.reports.map((report, index) => (
                  <PatientReportCard
                    key={report.id}
                    report={report}
                    index={index}
                    selectable
                    selected={selectedReports.includes(report.id)}
                    onSelect={() => toggleReportSelection(report.id)}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass" hover="lift">
                <CardHeader>
                  <CardTitle>Medical Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientTimeline reports={patient.reports} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {/* Health Journey */}
            <HealthJourneyTimeline reports={patient.reports} />
            
            {/* Charts */}
            <PatientMetricsChart reports={patient.reports} />
          </TabsContent>
        </Tabs>

        {/* Comparison Modal */}
        <AnimatePresence>
          {showComparison && comparison && (
            <ReportComparisonModal
              report1={{
                ...comparison.report1,
                summary: comparison.summary1 || undefined,
              }}
              report2={{
                ...comparison.report2,
                summary: comparison.summary2 || undefined,
              }}
              summary1={comparison.summary1}
              summary2={comparison.summary2}
              onClose={() => setShowComparison(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
