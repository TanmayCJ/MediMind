import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { FileText, Upload, CheckCircle, Clock, BarChart3 } from "lucide-react";
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
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Animated Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2">AI-Powered Diagnostic Report Analysis</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => navigate("/upload")} 
            size="lg" 
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Upload className="h-5 w-5" />
            Upload Report
          </Button>
        </motion.div>
      </motion.div>

      {/* Animated Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Reports"
          value={stats.total}
          icon={FileText}
          trend="All diagnostic reports"
          delay={0.1}
          gradient
        />
        <StatCard
          title="Completed Summaries"
          value={stats.completed}
          icon={CheckCircle}
          trend="Ready for review"
          delay={0.2}
          gradient
        />
        <StatCard
          title="Processing"
          value={stats.processing}
          icon={Clock}
          trend="AI analysis in progress"
          delay={0.3}
          gradient
        />
      </div>

      {/* Recent Reports with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="backdrop-blur-sm bg-card/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Latest diagnostic reports and their status</CardDescription>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={() => navigate("/history")}>
                  View All
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-8 w-8 border-b-2 border-primary"
                />
              </div>
            ) : reports.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No reports yet</h3>
                <p className="text-muted-foreground mt-2">Upload your first diagnostic report to get started</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => navigate("/upload")} className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Report
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card/80 backdrop-blur-sm hover:bg-accent/10 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => report.status === "completed" && navigate(`/summary/${report.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FileText className="h-5 w-5 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-medium">{report.patient_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(report.status)}
                          <span className="text-sm text-muted-foreground">
                            {report.report_type.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.uploaded_at).toLocaleDateString()}
                      </p>
                      {report.status === "completed" && (
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Button variant="ghost" size="sm" className="mt-2">
                            View Summary
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
