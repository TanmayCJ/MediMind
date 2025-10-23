import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Report {
  id: string;
  patient_name: string;
  patient_id: string;
  report_type: string;
  uploaded_at: string;
  status: string;
}

export default function History() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = reports.filter(
        (report) =>
          report.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.report_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [searchQuery, reports]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
      setFilteredReports(data || []);
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
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Report History
        </h1>
        <p className="text-muted-foreground mt-2">
          View and search through all your uploaded diagnostic reports
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="backdrop-blur-sm bg-card/50 shadow-xl">
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
            <CardDescription>
              Search by patient name, ID, or report type
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all focus:scale-[1.01]"
              />
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
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No reports found matching your search" : "No reports uploaded yet"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card/80 backdrop-blur-sm hover:bg-accent/10 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <p className="font-medium">{report.patient_name}</p>
                        {report.patient_id && (
                          <p className="text-sm text-muted-foreground">ID: {report.patient_id}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{report.report_type}</p>
                        <p className="text-sm text-muted-foreground">Report Type</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(report.uploaded_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Upload Date</p>
                      </div>
                      <div>
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                    {report.status === "completed" && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/summary/${report.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </motion.div>
                    )}
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
