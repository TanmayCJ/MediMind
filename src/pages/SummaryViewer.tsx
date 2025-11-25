import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, RefreshCw, FileText, Lightbulb, Loader2, CheckCircle2, Brain, Stethoscope, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import FloatingChat from "@/components/FloatingChat";

interface Report {
  id: string;
  patient_name: string;
  report_type: string;
  file_name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
}

interface Source {
  type: 'current_report' | 'similar_report';
  report_id: string;
  patient_name: string;
  report_type?: string;
  file_name?: string;
  relevance: number;
  snippet?: string;
  chunk_index?: number;
}

interface Summary {
  key_findings: string[];
  reasoning_steps: any;
  recommendations: string[];
  full_summary: string;
  sources?: Source[];
  rag_context_used?: string[];
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

      // Clean color scheme
      const colors = {
        primary: [0, 153, 198],
        secondary: [28, 184, 184],
        dark: [30, 41, 59],
        text: [51, 65, 85],
        lightGray: [248, 250, 252],
        white: [255, 255, 255]
      };

      // Simple text helper
      const addText = (text: string, fontSize: number = 10, weight: 'normal' | 'bold' = 'normal', color: number[] = colors.text) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', weight);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.6;
        });
        
        yPosition += 4;
      };

      // Simple bullet point
      const addBulletPoint = (text: string, bulletNumber: number) => {
        if (yPosition > pageHeight - 35) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Simple bullet circle
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.circle(margin + 5, yPosition - 1, 3, 'F');
        
        // Number
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(bulletNumber.toString(), margin + 5, yPosition + 1, { align: 'center' });
        
        // Text
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, maxWidth - 15);
        
        lines.forEach((line: string, index: number) => {
          if (yPosition + (index * 5) > pageHeight - 30) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(line, margin + 12, yPosition + (index * 5));
        });
        
        yPosition += lines.length * 5 + 6;
      };

      const addSpacer = (space: number = 8) => {
        yPosition += space;
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = 25;
        }
      };

      // Clean section header
      const addSection = (title: string) => {
        addSpacer(12);
        if (yPosition > pageHeight - 35) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Simple header background
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(margin - 5, yPosition - 8, maxWidth + 10, 16, 'F');
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), margin, yPosition);
        yPosition += 20;
        
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      };

      // Info box
      const addInfoBox = (title: string, content: string[]) => {
        const boxHeight = content.length * 6 + 18;
        
        if (yPosition + boxHeight > pageHeight - 25) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Box background
        doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
        doc.rect(margin - 5, yPosition - 5, maxWidth + 10, boxHeight, 'F');
        
        // Border
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(0.5);
        doc.rect(margin - 5, yPosition - 5, maxWidth + 10, boxHeight);
        
        // Title
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text(title, margin, yPosition + 5);
        yPosition += 12;
        
        // Content
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        content.forEach((line) => {
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
        
        yPosition += 8;
      };

      // ==================== HEADER ====================
      // Simple header background
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL ANALYSIS REPORT', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered Medical Intelligence Platform', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 50;
      
      // ==================== PATIENT INFO ====================
      addInfoBox('PATIENT INFORMATION', [
        `Patient Name: ${report.patient_name}`,
        `Report Type: ${report.report_type.toUpperCase()}`,
        `Analysis Date: ${new Date(report.uploaded_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        `Source File: ${report.file_name}`,
        `Analysis ID: ${report.id.slice(0, 8).toUpperCase()}`
      ]);

      // ==================== KEY FINDINGS ====================
      addSection('KEY CLINICAL FINDINGS');
      
      if (summary.key_findings && summary.key_findings.length > 0) {
        summary.key_findings.forEach((finding, index) => {
          addBulletPoint(finding, index + 1);
        });
      } else {
        addText('No key findings available in the analysis.', 10, 'normal', [120, 120, 120]);
      }

      // ==================== REASONING ====================
      addSection('DIAGNOSTIC REASONING PROCESS');
      
      if (summary.reasoning_steps && typeof summary.reasoning_steps === 'object') {
        const steps = Object.entries(summary.reasoning_steps);
        if (steps.length > 0) {
          steps.forEach(([step, reasoning], index) => {
            addText(`Step ${index + 1}: ${step}`, 11, 'bold', colors.primary);
            addText(String(reasoning), 10, 'normal', colors.text);
            addSpacer(6);
          });
        } else {
          addText('No reasoning steps available in the analysis.', 10, 'normal', [120, 120, 120]);
        }
      } else {
        addText('No reasoning steps available in the analysis.', 10, 'normal', [120, 120, 120]);
      }

      // ==================== RECOMMENDATIONS ====================
      addSection('CLINICAL RECOMMENDATIONS');
      
      if (summary.recommendations && summary.recommendations.length > 0) {
        summary.recommendations.forEach((rec, index) => {
          addBulletPoint(rec, index + 1);
        });
      } else {
        addText('No clinical recommendations available.', 10, 'normal', [120, 120, 120]);
      }

      // ==================== FULL SUMMARY ====================
      addSection('COMPLETE MEDICAL ANALYSIS');
      
      if (summary.full_summary) {
        // Parse and format the summary content for PDF
        const lines = summary.full_summary.split('\n');
        
        lines.forEach((line) => {
          const trimmedLine = line.trim();
          
          // Check for headers (remove ** formatting)
          const headerMatch = trimmedLine.match(/^\*\*(.+?)\*\*(.*)$/);
          if (headerMatch) {
            const headerText = headerMatch[1].replace(/\*\*/g, '').trim();
            const remainingText = headerMatch[2].trim();
            
            // Add sub-header
            addSpacer(6);
            addText(headerText, 11, 'bold', colors.primary);
            
            if (remainingText) {
              addText(remainingText, 10, 'normal', colors.text);
            }
          } else if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
            // Bullet point
            const bulletText = trimmedLine.substring(1).trim();
            if (bulletText) {
              addText(`• ${bulletText}`, 10, 'normal', colors.text);
            }
          } else if (trimmedLine) {
            // Regular content
            addText(trimmedLine, 10, 'normal', colors.text);
          }
        });
      } else {
        addText('No comprehensive analysis available.', 10, 'normal', [120, 120, 120]);
      }

      // ==================== FOOTER ====================
      const pageCount = doc.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer background
        doc.setFillColor(250, 250, 250);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        
        // Footer line
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(0.5);
        doc.line(0, pageHeight - 15, pageWidth, pageHeight - 15);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFont('helvetica', 'normal');
        
        doc.text('Generated by MediMind AI', margin, pageHeight - 8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 8, { align: 'right' });
        
        // Confidentiality notice
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text('CONFIDENTIAL MEDICAL DOCUMENT - FOR AUTHORIZED PERSONNEL ONLY', pageWidth / 2, pageHeight - 3, { align: 'center' });
      }

      // ==================== SAVE PDF ====================
      const fileName = `MediMind_${report.patient_name.replace(/\s+/g, '_')}_${report.report_type}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("Professional PDF report generated successfully!");
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <Loader2 className="h-16 w-16 text-primary relative z-10" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-muted-foreground font-medium"
        >
          Loading analysis...
        </motion.p>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/dashboard")}
                  className="hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    {report.patient_name}
                  </h1>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 ml-11">
                  <Badge variant="outline" className="text-xs">{report.report_type}</Badge>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{new Date(report.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="gap-2 hover:border-primary/50 hover:bg-primary/5"
                >
                  <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleDownloadPDF}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

      {/* Single Column Layout - Better UX */}
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Patient & Report Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="backdrop-blur-xl bg-card/40 border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <CardContent className="relative pt-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{report.file_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">{report.report_type}</Badge>
                      </span>
                      <span>Uploaded {new Date(report.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewOriginal} className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Original
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Analysis Section */}
        {!summary ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-xl bg-card/40 border-primary/20 shadow-2xl">
              <CardContent className="py-20">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                  >
                    <Loader2 className="h-16 w-16 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold mb-2">
                    {report.status === "processing" 
                      ? "Analyzing Report..." 
                      : "Ready to Analyze"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {report.status === "processing" 
                      ? "Our AI is generating a comprehensive medical analysis. This may take a few moments..."
                      : "No AI summary available yet. Generate one now."}
                  </p>
                  {report.status !== "processing" && (
                    <Button onClick={handleRegenerate} size="lg" className="gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Generate Analysis
                    </Button>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Key Findings Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="group backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-primary/30 shadow-2xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl group-hover:from-primary/15 transition-all duration-500" />
                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/20"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Key Clinical Findings</CardTitle>
                      <CardDescription className="text-sm">Primary observations and diagnostic results</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-6">
                  <div className="space-y-4">
                    {summary.key_findings?.map((finding, i) => {
                      // Extract medical reference citations from the finding text
                      const refMatch = finding.match(/\(Ref:\s*([^)]+)\)/i);
                      const findingText = finding.replace(/\(Ref:\s*[^)]+\)/i, '').trim();
                      const medicalRefs = refMatch ? refMatch[1].split(',').map(s => s.trim()) : [];
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                          className="group flex flex-col gap-3 p-5 border-l-4 border-primary/40 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent rounded-r-xl hover:border-primary hover:shadow-xl hover:from-primary/12 hover:translate-x-1 transition-all duration-300"
                        >
                          <div className="flex gap-4">
                            <motion.div 
                              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold shadow-md"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              {i + 1}
                            </motion.div>
                            <p className="text-base leading-relaxed flex-1 pt-1.5">{findingText}</p>
                          </div>
                          {medicalRefs.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (i * 0.1) + 0.2 }}
                              className="flex flex-wrap gap-2 ml-14"
                            >
                              {medicalRefs.map((ref, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/25 transition-all">
                                  📖 {ref}
                                </Badge>
                              ))}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chain of Thought Reasoning Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="group backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-accent/30 shadow-2xl hover:shadow-accent/20 hover:border-accent/50 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-full blur-3xl group-hover:from-accent/15 transition-all duration-500" />
                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 shadow-lg shadow-accent/20"
                      whileHover={{ scale: 1.05, rotate: -5 }}
                    >
                      <Brain className="h-6 w-6 text-accent" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Chain-of-Thought Analysis</CardTitle>
                      <CardDescription className="text-sm">Step-by-step diagnostic reasoning</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-6">
                  <div className="space-y-6">
                    {summary.reasoning_steps && Object.entries(summary.reasoning_steps).map(([step, reasoning], i, arr) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15, type: "spring", stiffness: 80 }}
                        className="relative"
                      >
                        <div className="flex gap-5">
                          <div className="relative flex flex-col items-center">
                            <motion.div 
                              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-accent via-accent/80 to-accent/60 flex items-center justify-center text-white font-bold shadow-xl shadow-accent/30"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              {i + 1}
                            </motion.div>
                            {i < arr.length - 1 && (
                              <motion.div 
                                className="w-1 h-full bg-gradient-to-b from-accent/50 via-accent/30 to-transparent absolute top-14 rounded-full"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: (i * 0.15) + 0.3, duration: 0.5 }}
                              />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <motion.div 
                              className="p-5 rounded-xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/30 hover:border-accent/50 hover:shadow-xl hover:from-accent/15 transition-all duration-300"
                              whileHover={{ x: 5 }}
                            >
                              <h4 className="font-bold text-accent mb-3 text-lg">{step}</h4>
                              <p className="text-sm leading-relaxed">{String(reasoning)}</p>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Clinical Recommendations Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="group backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-green-500/30 shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent rounded-full blur-3xl group-hover:from-green-500/15 transition-all duration-500" />
                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 shadow-lg shadow-green-500/20"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Clinical Recommendations</CardTitle>
                      <CardDescription className="text-sm">Actionable next steps and considerations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-6">
                  <div className="space-y-4">
                    {summary.recommendations?.map((rec, i) => {
                      // Extract medical reference citations from recommendations
                      const refMatch = rec.match(/\(Ref:\s*([^)]+)\)/i);
                      const recText = rec.replace(/\(Ref:\s*[^)]+\)/i, '').trim();
                      const medicalRefs = refMatch ? refMatch[1].split(',').map(s => s.trim()) : [];
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                          className="group flex flex-col gap-3 p-5 border-l-4 border-green-500/40 bg-gradient-to-r from-green-500/8 via-green-500/4 to-transparent rounded-r-xl hover:border-green-500 hover:shadow-xl hover:from-green-500/12 hover:translate-x-1 transition-all duration-300"
                        >
                          <div className="flex gap-4">
                            <motion.div
                              className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center shadow-md"
                              whileHover={{ scale: 1.1, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </motion.div>
                            <p className="text-base leading-relaxed flex-1 pt-0.5">{recText}</p>
                          </div>
                          {medicalRefs.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (i * 0.1) + 0.2 }}
                              className="flex flex-wrap gap-2 ml-11"
                            >
                              {medicalRefs.map((ref, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/25 transition-all">
                                  📖 {ref}
                                </Badge>
                              ))}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Full Summary Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="group backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-primary/30 shadow-2xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-green-500" />
                <CardHeader className="pt-8">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/20"
                      whileHover={{ scale: 1.05, rotate: -5 }}
                    >
                      <FileText className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Complete Medical Analysis</CardTitle>
                      <CardDescription className="text-sm">Comprehensive diagnostic summary</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {summary.full_summary ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {(() => {
                          const lines = summary.full_summary.split('\n');
                          const parsedContent: any[] = [];
                          let currentSection: any = null;
                          let sectionCounter = 1;

                          lines.forEach((line, index) => {
                            const trimmedLine = line.trim();
                            
                            // Check for main section headers (like "**2. Step-by-Step Reasoning:**" or "**Clinical Recommendations:**")
                            const mainSectionMatch = trimmedLine.match(/^\*\*(\d+\.\s*[^*:]+):?\*\*\s*$/);
                            
                            // Check for sub-headers (like "**1. Neurosurgical Consultation:**")
                            const subHeaderMatch = trimmedLine.match(/^\*\*(\d+\.\s*[^*]+?)\*\*(.*)$/);
                            
                            // Check for any other **text** pattern
                            const genericHeaderMatch = trimmedLine.match(/^\*\*([^*]+?)\*\*(.*)$/);
                            
                            if (mainSectionMatch) {
                              // Save previous section if exists
                              if (currentSection) {
                                parsedContent.push(currentSection);
                              }
                              
                              // Main section header
                              let headerText = mainSectionMatch[1].trim();
                              headerText = headerText.replace(/\*\*/g, '');
                              
                              currentSection = {
                                type: 'main-section',
                                title: headerText,
                                content: [],
                                number: sectionCounter++
                              };
                            } else if (subHeaderMatch || genericHeaderMatch) {
                              const match = subHeaderMatch || genericHeaderMatch;
                              
                              // Sub-header within current section
                              let headerText = match[1].trim();
                              headerText = headerText.replace(/\*\*/g, '');
                              const remainingText = match[2].trim();
                              
                              if (currentSection) {
                                currentSection.content.push({
                                  type: 'sub-header',
                                  title: headerText,
                                  content: remainingText ? [remainingText] : []
                                });
                              } else {
                                // If no main section exists, create one
                                currentSection = {
                                  type: 'section',
                                  title: headerText,
                                  content: [],
                                  number: sectionCounter++
                                };
                                
                                if (remainingText) {
                                  currentSection.content.push(remainingText);
                                }
                              }
                            } else if (trimmedLine.includes('**') && trimmedLine.includes('**')) {
                              // Additional fallback for any remaining ** patterns
                              const cleanedLine = trimmedLine.replace(/\*\*/g, '');
                              if (currentSection) {
                                currentSection.content.push(cleanedLine);
                              } else {
                                parsedContent.push({ type: 'intro', text: cleanedLine });
                              }
                            } else if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
                              // Bullet point
                              const bulletText = trimmedLine.substring(1).trim();
                              if (currentSection && bulletText) {
                                // Add to the last sub-header if it exists, otherwise to main section
                                const lastContent = currentSection.content[currentSection.content.length - 1];
                                if (lastContent && typeof lastContent === 'object' && lastContent.type === 'sub-header') {
                                  lastContent.content.push({ type: 'bullet', text: bulletText });
                                } else {
                                  currentSection.content.push({ type: 'bullet', text: bulletText });
                                }
                              }
                            } else if (trimmedLine && currentSection) {
                              // Regular content line
                              const lastContent = currentSection.content[currentSection.content.length - 1];
                              if (lastContent && typeof lastContent === 'object' && lastContent.type === 'sub-header') {
                                lastContent.content.push(trimmedLine);
                              } else {
                                currentSection.content.push(trimmedLine);
                              }
                            } else if (trimmedLine && !currentSection) {
                              // Introduction text before any sections
                              parsedContent.push({ type: 'intro', text: trimmedLine });
                            }
                          });
                          
                          // Add last section
                          if (currentSection) {
                            parsedContent.push(currentSection);
                          }

                          return parsedContent.map((item, index) => {
                            if (item.type === 'intro') {
                              return (
                                <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary/30">
                                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                                    {item.text}
                                  </p>
                                </div>
                              );
                            } else if (item.type === 'main-section') {
                              return (
                                <div key={index} className="space-y-4">
                                  {/* Main Section Header - Larger and more prominent */}
                                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-accent/10 border-2 border-primary/30 shadow-lg">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                                      <span className="text-white font-bold text-lg">{item.number}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-primary">{item.title}</h2>
                                  </div>
                                  
                                  {/* Main Section Content */}
                                  <div className="ml-6 space-y-3">
                                    {item.content.map((contentItem: any, contentIndex: number) => {
                                      if (typeof contentItem === 'object' && contentItem.type === 'sub-header') {
                                        return (
                                          <div key={contentIndex} className="space-y-2">
                                            {/* Sub-header - Smaller and distinct */}
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
                                              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                                                <span className="text-accent font-semibold text-xs">•</span>
                                              </div>
                                              <h4 className="font-semibold text-accent text-base">{contentItem.title}</h4>
                                            </div>
                                            {/* Sub-header content */}
                                            <div className="ml-8 space-y-2">
                                              {contentItem.content.map((subItem: any, subIndex: number) => {
                                                if (typeof subItem === 'object' && subItem.type === 'bullet') {
                                                  return (
                                                    <div key={subIndex} className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-200">
                                                      <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                                                      <p className="text-sm leading-relaxed">{subItem.text}</p>
                                                    </div>
                                                  );
                                                } else if (typeof subItem === 'string') {
                                                  return (
                                                    <div key={subIndex} className="p-3 rounded-lg bg-gradient-to-r from-muted/20 to-transparent">
                                                      <p className="text-sm leading-relaxed">{subItem}</p>
                                                    </div>
                                                  );
                                                } else {
                                                  return null;
                                                }
                                              })}
                                            </div>
                                          </div>
                                        );
                                      } else if (typeof contentItem === 'object' && contentItem.type === 'bullet') {
                                        return (
                                          <div key={contentIndex} className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-200">
                                            <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                                            <p className="text-sm leading-relaxed">{contentItem.text}</p>
                                          </div>
                                        );
                                      } else if (typeof contentItem === 'string') {
                                        return (
                                          <div key={contentIndex} className="p-3 rounded-lg bg-gradient-to-r from-muted/20 to-transparent">
                                            <p className="text-sm leading-relaxed">{contentItem}</p>
                                          </div>
                                        );
                                      } else {
                                        return null;
                                      }
                                    })}
                                  </div>
                                </div>
                              );
                            } else if (item.type === 'section') {
                              return (
                                <div key={index} className="space-y-3">
                                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
                                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                      <span className="text-accent font-bold text-sm">{item.number}</span>
                                    </div>
                                    <h3 className="font-semibold text-accent">{item.title}</h3>
                                  </div>
                                  <div className="ml-4 space-y-2">
                                    {item.content.map((contentItem: any, contentIndex: number) => {
                                      if (typeof contentItem === 'object' && contentItem.type === 'bullet') {
                                        return (
                                          <div key={contentIndex} className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-200">
                                            <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                                            <p className="text-sm leading-relaxed">{contentItem.text}</p>
                                          </div>
                                        );
                                      } else if (typeof contentItem === 'string') {
                                        return (
                                          <div key={contentIndex} className="p-3 rounded-lg bg-gradient-to-r from-muted/20 to-transparent">
                                            <p className="text-sm leading-relaxed">{contentItem}</p>
                                          </div>
                                        );
                                      } else {
                                        // Skip objects that aren't bullet points
                                        return null;
                                      }
                                    })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          });
                        })()}
                        
                        {/* Fallback for completely unstructured content */}
                        {!summary.full_summary.includes('**') && (
                          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border border-primary/10">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {summary.full_summary}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="p-4 rounded-lg bg-muted/20 border-2 border-dashed border-muted">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No comprehensive analysis available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Medical References Section - Hidden as references are shown inline with findings/recommendations */}
            {/* The medical literature citations appear as badges under each finding and recommendation */}
            {false && summary.sources && summary.sources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="backdrop-blur-xl bg-card/40 border-accent/20 shadow-2xl overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5">
                        <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-xl">Sources & References</CardTitle>
                        <CardDescription>Medical reports and context used for analysis</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.sources.map((source, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group p-4 rounded-lg border border-border/50 bg-gradient-to-r from-muted/20 to-transparent hover:border-accent/50 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={source.type === 'current_report' ? 'default' : 'secondary'} className="text-xs">
                                  {source.type === 'current_report' ? '📄 Current Report' : '🔗 Similar Case'}
                                </Badge>
                                {source.relevance && source.relevance < 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    {(source.relevance * 100).toFixed(0)}% relevant
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{source.patient_name}</p>
                                {source.report_type && (
                                  <p className="text-xs text-muted-foreground capitalize">{source.report_type} Report</p>
                                )}
                                {source.file_name && (
                                  <p className="text-xs text-muted-foreground mt-1">{source.file_name}</p>
                                )}
                              </div>
                              {source.snippet && (
                                <p className="text-xs text-muted-foreground italic line-clamp-2 mt-2 pl-3 border-l-2 border-muted">
                                  {source.snippet}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
      </div>

      {/* Floating AI Assistant */}
      {report && (
        <FloatingChat 
          reportId={report.id}
          reportContext={{
            patient_name: report.patient_name,
            report_type: report.report_type,
            summary: summary
          }}
        />
      )}
    </div>
  );
}
