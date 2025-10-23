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
import jsPDF from 'jspdf';

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

  const handleDownloadPDF = () => {
    if (!report || !summary) {
      toast.error("No summary available to download");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Helper function to add text with automatic page breaks
      const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        
        yPosition += 5;
      };

      const addSpacer = (space: number = 10) => {
        yPosition += space;
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
      };

      const addSection = (title: string) => {
        addSpacer(8);
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Section background
        doc.setFillColor(0, 153, 198);
        doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 12, 'F');
        
        // Section title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPosition + 3);
        yPosition += 15;
        
        doc.setTextColor(0, 0, 0);
      };

      // ==================== HEADER ====================
      // Title
      doc.setFillColor(0, 153, 198);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL REPORT ANALYSIS', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered Medical Intelligence Platform', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 45;
      
      // ==================== PATIENT INFO ====================
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 30, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', margin, yPosition + 3);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Patient Name: ${report.patient_name}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Report Type: ${report.report_type.toUpperCase()}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Date: ${new Date(report.uploaded_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Report File: ${report.file_name}`, margin, yPosition);
      
      addSpacer(10);

      // ==================== KEY FINDINGS ====================
      addSection('🔍 KEY FINDINGS');
      
      if (summary.key_findings && summary.key_findings.length > 0) {
        summary.key_findings.forEach((finding, index) => {
          const bulletText = `${index + 1}. ${finding}`;
          addText(bulletText, 11, false);
          addSpacer(3);
        });
      } else {
        addText('No key findings available.', 11, false, [100, 100, 100]);
      }

      // ==================== CHAIN-OF-THOUGHT REASONING ====================
      addSection('🧠 CHAIN-OF-THOUGHT REASONING');
      
      if (summary.reasoning_steps && typeof summary.reasoning_steps === 'object') {
        const steps = Object.entries(summary.reasoning_steps);
        if (steps.length > 0) {
          steps.forEach(([step, reasoning], index) => {
            addText(`${step}:`, 11, true, [0, 102, 204]);
            addText(String(reasoning), 10, false);
            addSpacer(5);
          });
        } else {
          addText('No reasoning steps available.', 11, false, [100, 100, 100]);
        }
      } else {
        addText('No reasoning steps available.', 11, false, [100, 100, 100]);
      }

      // ==================== RECOMMENDATIONS ====================
      addSection('💡 CLINICAL RECOMMENDATIONS');
      
      if (summary.recommendations && summary.recommendations.length > 0) {
        summary.recommendations.forEach((rec, index) => {
          const bulletText = `${index + 1}. ${rec}`;
          addText(bulletText, 11, false);
          addSpacer(3);
        });
      } else {
        addText('No recommendations available.', 11, false, [100, 100, 100]);
      }

      // ==================== FULL SUMMARY ====================
      addSection('📋 COMPLETE ANALYSIS SUMMARY');
      
      if (summary.full_summary) {
        addText(summary.full_summary, 10, false);
      } else {
        addText('No full summary available.', 11, false, [100, 100, 100]);
      }

      // ==================== FOOTER ====================
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Generated by MediMind AI | Page ${i} of ${pageCount} | ${new Date().toLocaleString()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // ==================== SAVE PDF ====================
      const fileName = `${report.patient_name.replace(/\s+/g, '_')}_${report.report_type}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
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
            <Button variant="outline" onClick={handleDownloadPDF}>
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
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="findings">Key Findings</TabsTrigger>
                    <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="full">Full Summary</TabsTrigger>
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

                  <TabsContent value="reasoning" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      {summary.reasoning_steps && Object.entries(summary.reasoning_steps).map(([step, reasoning], i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {i + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-1">{step}</h4>
                              <p className="text-sm text-muted-foreground">{String(reasoning)}</p>
                            </div>
                          </div>
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

                  <TabsContent value="full" className="space-y-4 mt-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-accent/5"
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {summary.full_summary || "No full summary available"}
                        </p>
                      </div>
                    </motion.div>
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
