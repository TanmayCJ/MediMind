import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, RefreshCw, FileText, Lightbulb, List, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Report {
  id: string;
  patient_name: string;
  report_type: string;
  file_name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
}

interface Summary {
  key_findings: string[];
  reasoning_steps: any;
  recommendations: string[];
  full_summary: string;
}

export default function SummaryViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReportAndSummary();
    }
  }, [id]);

  const fetchReportAndSummary = async () => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

      if (reportError) throw reportError;
      setReport(reportData);

      const { data: summaryData, error: summaryError } = await supabase
        .from("summaries")
        .select("*")
        .eq("report_id", id)
        .maybeSingle();

      if (summaryError) throw summaryError;
      setSummary(summaryData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    toast.info("Regenerating AI summary...");
    const { error } = await supabase.functions.invoke('generate-summary', {
      body: { reportId: id }
    });

    if (error) {
      toast.error("Failed to regenerate summary");
    } else {
      toast.success("Summary regenerated successfully!");
      await fetchReportAndSummary();
    }
    setRegenerating(false);
  };

  const handleViewOriginal = async () => {
    if (!report) return;
    
    try {
      // Extract the file path from the public URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/medical-reports/[path]
      const urlParts = report.file_url.split('/medical-reports/');
      if (urlParts.length < 2) {
        throw new Error("Invalid file URL");
      }
      const filePath = urlParts[1];
      
      // Download the file using Supabase Storage
      const { data, error } = await supabase.storage
        .from('medical-reports')
        .download(filePath);
      
      if (error) throw error;
      
      // Create a blob URL and open it in a new tab
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the blob URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error: any) {
      console.error('Error viewing file:', error);
      toast.error("Failed to view original file");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-primary"
        />
      </div>
    );
  }

  if (!report) {
    return (
      <motion.div 
        className="p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-muted-foreground mb-4">Report not found</p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div 
        className="mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {report.patient_name}
            </h1>
            <p className="text-muted-foreground">
              {report.report_type} • {new Date(report.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={handleRegenerate} disabled={regenerating}>
              {regenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerate
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        {/* Original Report */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="backdrop-blur-sm bg-card/50 shadow-xl h-full">
            <CardHeader>
              <CardTitle>Original Report</CardTitle>
              <CardDescription>Uploaded diagnostic file</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="border rounded-lg p-6 bg-gradient-to-br from-primary/5 to-accent/5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-center font-medium mb-2">{report.file_name}</p>
                <Button variant="outline" className="w-full" onClick={handleViewOriginal}>
                  View Original File
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-card/50 shadow-xl h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Analysis</CardTitle>
                <AnimatePresence mode="wait">
                  {report.status === "processing" ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge variant="default" className="animate-pulse">Processing...</Badge>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge variant="default">Completed</Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <CardDescription>AI-powered medical analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {!summary ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-4"
                  >
                    <Loader2 className="h-12 w-12 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground mb-4">
                    {report.status === "processing" 
                      ? "AI summary is being generated. This may take a few moments..."
                      : "No AI summary available yet"}
                  </p>
                  <Button onClick={handleRegenerate}>Generate Summary</Button>
                </motion.div>
              ) : (
                <Tabs defaultValue="findings" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="findings">Key Findings</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="findings" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      {summary.key_findings?.map((finding, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-3 p-3 border rounded-lg bg-gradient-to-r from-warning/5 to-transparent hover:shadow-md transition-shadow"
                        >
                          <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{finding}</p>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      {summary.recommendations?.map((rec, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-3 p-3 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:shadow-md transition-shadow"
                        >
                          <List className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
