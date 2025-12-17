import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Zap, 
  Brain,
  Sparkles,
  ArrowRight,
  Eye,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Report {
  id: string;
  patient_name: string;
  report_type: string;
  uploaded_at: string;
  status: string;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const statsY = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      // Fetch all reports
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      // Fetch actual summaries count
      const { count: summariesCount, error: summariesError } = await supabase
        .from("summaries")
        .select("*", { count: "exact", head: true });

      if (summariesError) console.warn("Could not fetch summaries count:", summariesError);

      // Calculate unique patients
      const uniquePatients = new Set(
        (data || []).map(r => r.patient_id || r.patient_name)
      );

      setReports((data || []).slice(0, 5));
      
      // Calculate stats from actual data
      const total = data?.length || 0;
      const completed = summariesCount || data?.filter(r => r.status === "completed").length || 0;
      const processing = data?.filter(r => r.status === "processing" || r.status === "uploaded").length || 0;
      const totalPatients = uniquePatients.size;
      setStats({ total, completed, processing, totalPatients });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      uploaded: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background is now handled by DashboardLayout */}

      <div className="container mx-auto px-6 py-8 space-y-8 max-w-7xl relative z-10">
        {/* Hero Section - SpaceX Style */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative pt-8 pb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 1, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">AI-Powered Medical Intelligence</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent leading-tight">
              Medical Intelligence Hub
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Transform diagnostic reports into actionable insights with cutting-edge AI
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate("/upload")} 
                  size="lg" 
                  className="gap-2 text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
                >
                  <Brain className="h-5 w-5" />
                  Start Analysis
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate("/history")} 
                  variant="outline"
                  size="lg" 
                  className="gap-2 text-lg px-8 py-6 rounded-full border-2"
                >
                  <Activity className="h-5 w-5" />
                  View History
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated Stats Grid - Pure Glass Cards */}
        <motion.div 
          style={{ y: statsY }}
          className="grid gap-5 md:grid-cols-4"
        >
          {/* Total Patients Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="cursor-pointer"
            onClick={() => navigate("/patients")}
          >
            <Card variant="glass" hover="bright" className="h-full">
              {/* Top shine */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-t-2xl" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Users className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                </div>
                <CardTitle className="text-4xl font-bold text-slate-800 dark:text-white/90">
                  {stats.totalPatients}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-white/50 font-medium">Total Patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Click to view all</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Reports Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card variant="glass" hover="bright" className="h-full">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent rounded-t-2xl" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                    <FileText className="h-6 w-6 text-sky-500 dark:text-sky-400" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                </div>
                <CardTitle className="text-4xl font-bold text-slate-800 dark:text-white/90">
                  {stats.total}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-white/50 font-medium">Total Reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                  <Activity className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
                  <span>All time analyzed</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Completed Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card variant="glass" hover="bright" className="h-full">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent rounded-t-2xl" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>
                <CardTitle className="text-4xl font-bold text-slate-800 dark:text-white/90">
                  {stats.completed}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-white/50 font-medium">Summaries Complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                  <Zap className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Ready for review</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Processing Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card variant="glass" hover="bright" className="h-full">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent rounded-t-2xl" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Brain className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]"
                  />
                </div>
                <CardTitle className="text-4xl font-bold text-slate-800 dark:text-white/90">
                  {stats.processing}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-white/50 font-medium">AI Processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                  <Clock className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>Analysis in progress</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Reports - Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card variant="glass" className="overflow-hidden">
            {/* Top shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent rounded-t-2xl" />
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                    <CardTitle className="text-xl text-slate-800 dark:text-white/90">Recent Reports</CardTitle>
                  </div>
                  <CardDescription className="text-slate-500 dark:text-white/50">
                    Latest diagnostic reports and analysis status
                  </CardDescription>
                </div>
                <Button 
                  variant="glass"
                  onClick={() => navigate("/history")}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  View All
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="relative">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity }
                      }}
                      className="relative"
                    >
                      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
                      <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                    </motion.div>
                    <p className="mt-6 text-muted-foreground font-medium">Loading reports...</p>
                  </motion.div>
                ) : reports.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-20"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="inline-block"
                    >
                      <FileText className="mx-auto h-20 w-20 text-primary/50" />
                    </motion.div>
                    <h3 className="mt-6 text-2xl font-bold">No Reports Yet</h3>
                    <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
                      Begin your analysis by uploading your first diagnostic report
                    </p>
                    <motion.div 
                      className="mt-8"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={() => navigate("/upload")} 
                        size="lg"
                        className="gap-2 px-8 py-6 text-lg rounded-full bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/50 transition-all duration-300"
                      >
                        <Upload className="h-5 w-5" />
                        Initiate Mission
                        <Sparkles className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="reports"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {reports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                        className="relative group"
                      >
                        <div
                          className="relative flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] hover:border-black/[0.08] dark:hover:border-white/[0.15] transition-all duration-200 cursor-pointer"
                          onClick={() => report.status === "completed" && navigate(`/summary/${report.id}`)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Icon with status */}
                            <div className="relative">
                              <div className={`p-3 rounded-xl ${
                                report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' :
                                report.status === 'processing' ? 'bg-violet-500/10 text-violet-500 dark:text-violet-400' :
                                'bg-sky-500/10 text-sky-500 dark:text-sky-400'
                              }`}>
                                <FileText className="h-5 w-5" />
                              </div>
                              {report.status === 'completed' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Report Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-700 dark:text-white/90 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {report.patient_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06] text-slate-500 dark:text-white/50 font-medium">
                                  {report.report_type.replace("_", " ").toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-white/30 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(report.uploaded_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status/Action */}
                          <div className="flex items-center gap-3">
                            {report.status === "completed" && (
                              <Button 
                                variant="glass"
                                size="sm"
                                className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                            )}
                            
                            {report.status === "processing" && (
                              <div className="flex items-center gap-2 text-xs text-violet-400">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <Brain className="h-4 w-4" />
                                </motion.div>
                                <span>Analyzing...</span>
                              </div>
                            )}
                            
                            <Badge 
                              variant={
                                report.status === 'completed' ? 'glassSuccess' :
                                report.status === 'processing' ? 'glassPrimary' :
                                'glass'
                              }
                              className="capitalize text-[10px]"
                            >
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
