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
  Eye
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
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0 });
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
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("uploaded_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setReports(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const completed = data?.filter(r => r.status === "completed").length || 0;
      const processing = data?.filter(r => r.status === "processing").length || 0;
      setStats({ total, completed, processing });
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

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

        {/* Animated Stats Grid - SpaceX Mission Stats Style */}
        <motion.div 
          style={{ y: statsY }}
          className="grid gap-6 md:grid-cols-3"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <Card className="relative backdrop-blur-xl bg-card/40 border-primary/20 shadow-2xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-dashed border-primary/20"
                  />
                </div>
                <CardTitle className="text-4xl font-bold mt-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stats.total}
                </CardTitle>
                <CardDescription className="text-base font-medium">Total Reports Analyzed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Mission active</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <Card className="relative backdrop-blur-xl bg-card/40 border-green-500/20 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                        className="w-2 h-2 rounded-full bg-green-500"
                      />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold mt-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stats.completed}
                </CardTitle>
                <CardDescription className="text-base font-medium">Summaries Complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Ready for review</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <Card className="relative backdrop-blur-xl bg-card/40 border-accent/20 shadow-2xl hover:shadow-accent/20 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-accent animate-pulse" />
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity className="h-6 w-6 text-accent" />
                  </motion.div>
                </div>
                <CardTitle className="text-4xl font-bold mt-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stats.processing}
                </CardTitle>
                <CardDescription className="text-base font-medium">AI Processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-accent animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-muted-foreground">Analysis in progress</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Reports - Interactive List */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative"
        >
          <Card className="backdrop-blur-xl bg-card/40 border-primary/10 shadow-2xl overflow-hidden">
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-gradient-x" style={{ padding: '1px' }}>
              <div className="w-full h-full rounded-xl bg-card" />
            </div>
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          '0 0 0 0 rgba(var(--primary), 0.7)',
                          '0 0 0 10px rgba(var(--primary), 0)',
                          '0 0 0 0 rgba(var(--primary), 0)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-primary"
                    />
                    <CardTitle className="text-2xl">Recent Reports</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Latest diagnostic reports and analysis status
                  </CardDescription>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/history")}
                    className="gap-2 border-2 hover:bg-primary/10"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View All Reports
                  </Button>
                </motion.div>
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
                    className="space-y-4"
                  >
                    {reports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          x: 8,
                          transition: { duration: 0.2 }
                        }}
                        onHoverStart={() => setHoveredCard(report.id)}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative group"
                      >
                        {/* Hover Glow Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={hoveredCard === report.id ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        
                        <div
                          className="relative flex items-center justify-between p-6 rounded-xl border-2 border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
                          onClick={() => report.status === "completed" && navigate(`/summary/${report.id}`)}
                        >
                          {/* Status Indicator Line */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            report.status === 'completed' ? 'bg-green-500' :
                            report.status === 'processing' ? 'bg-accent animate-pulse' :
                            'bg-primary/50'
                          }`} />

                          <div className="flex items-center gap-6 flex-1">
                            {/* Animated Icon */}
                            <motion.div 
                              className="relative"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 relative overflow-hidden">
                                {report.status === 'processing' && (
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: [-100, 100] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                )}
                                <FileText className="h-7 w-7 text-primary relative z-10" />
                              </div>
                              {report.status === 'completed' && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                                >
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </motion.div>

                            {/* Report Info */}
                            <div className="flex-1 space-y-2">
                              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                {report.patient_name}
                              </h3>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge 
                                  variant={
                                    report.status === 'completed' ? 'default' :
                                    report.status === 'processing' ? 'secondary' :
                                    'outline'
                                  }
                                  className="capitalize"
                                >
                                  {report.status === 'processing' && (
                                    <motion.span
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                      className="inline-block mr-1"
                                    >
                                      ⚡
                                    </motion.span>
                                  )}
                                  {report.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-medium px-3 py-1 rounded-full bg-primary/5">
                                  {report.report_type.replace("_", " ").toUpperCase()}
                                </span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(report.uploaded_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          {report.status === "completed" && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ x: 5 }}
                            >
                              <Button 
                                variant="ghost" 
                                size="lg"
                                className="gap-2 group/btn"
                              >
                                <Eye className="h-5 w-5 group-hover/btn:text-primary transition-colors" />
                                <span className="font-semibold">View Report</span>
                                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </motion.div>
                          )}
                          
                          {report.status === "processing" && (
                            <motion.div
                              animate={{ 
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="flex items-center gap-2 text-accent font-medium"
                            >
                              <Brain className="h-5 w-5 animate-pulse" />
                              <span>Analyzing...</span>
                            </motion.div>
                          )}
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
