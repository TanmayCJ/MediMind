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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </motion.div>
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
            {/* Key Findings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="backdrop-blur-xl bg-card/40 border-primary/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Key Clinical Findings</CardTitle>
                      <CardDescription>Primary observations and diagnostic results</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    {summary.key_findings?.map((finding, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex gap-4 p-4 border-l-4 border-primary/50 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg hover:border-primary hover:shadow-lg hover:from-primary/10 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {i + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{finding}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chain of Thought Reasoning Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="backdrop-blur-xl bg-card/40 border-accent/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5">
                      <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Chain-of-Thought Analysis</CardTitle>
                      <CardDescription>Step-by-step reasoning process</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    {summary.reasoning_steps && Object.entries(summary.reasoning_steps).map(([step, reasoning], i, arr) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative"
                      >
                        <div className="flex gap-4">
                          <div className="relative flex flex-col items-center">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-white font-bold shadow-lg">
                              {i + 1}
                            </div>
                            {i < arr.length - 1 && (
                              <div className="w-0.5 h-full bg-gradient-to-b from-accent/50 to-transparent absolute top-10" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="p-4 rounded-lg bg-gradient-to-r from-accent/5 to-transparent border border-accent/20 hover:border-accent/40 hover:shadow-md transition-all duration-300">
                              <h4 className="font-semibold text-accent mb-2">{step}</h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">{String(reasoning)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Clinical Recommendations Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="backdrop-blur-xl bg-card/40 border-green-500/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Clinical Recommendations</CardTitle>
                      <CardDescription>Actionable next steps and considerations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    {summary.recommendations?.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex gap-4 p-4 border-l-4 border-green-500/50 bg-gradient-to-r from-green-500/5 to-transparent rounded-r-lg hover:border-green-500 hover:shadow-lg hover:from-green-500/10 transition-all duration-300"
                      >
                        <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4"/>
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Full Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="backdrop-blur-xl bg-card/40 border-primary/20 shadow-2xl overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Complete Medical Analysis</CardTitle>
                      <CardDescription>Comprehensive diagnostic summary</CardDescription>
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
                                                } else {
                                                  return (
                                                    <div key={subIndex} className="p-3 rounded-lg bg-gradient-to-r from-muted/20 to-transparent">
                                                      <p className="text-sm leading-relaxed">{subItem}</p>
                                                    </div>
                                                  );
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
                                      } else {
                                        return (
                                          <div key={contentIndex} className="p-3 rounded-lg bg-gradient-to-r from-muted/20 to-transparent">
                                            <p className="text-sm leading-relaxed">{contentItem}</p>
                                          </div>
                                        );
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
                                      } else {
                                        return (
                                          <div key={contentIndex} className="p-3 rounded-lg bg-gradient-to-r from-muted/20 to-transparent">
                                            <p className="text-sm leading-relaxed">{contentItem}</p>
                                          </div>
                                        );
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
          </>
        )}
      </div>
    </div>
  );
}
