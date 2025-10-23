import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, RefreshCw, FileText, Lightbulb, List } from "lucide-react";
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
    toast.info("Regenerating AI summary...");
    const { error } = await supabase.functions.invoke('generate-summary', {
      body: { reportId: id }
    });

    if (error) {
      toast.error("Failed to regenerate summary");
    } else {
      toast.success("Summary regenerated successfully!");
      fetchReportAndSummary();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Report not found</p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{report.patient_name}</h1>
            <p className="text-muted-foreground">
              {report.report_type} • {new Date(report.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Original Report */}
        <Card>
          <CardHeader>
            <CardTitle>Original Report</CardTitle>
            <CardDescription>Uploaded diagnostic file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-muted/30">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-center font-medium mb-2">{report.file_name}</p>
              <Button variant="outline" className="w-full" asChild>
                <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                  View Original File
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Analysis</CardTitle>
              {report.status === "processing" && (
                <Badge variant="default">Processing...</Badge>
              )}
              {report.status === "completed" && (
                <Badge variant="default">Completed</Badge>
              )}
            </div>
            <CardDescription>Chain-of-Thought reasoning summary</CardDescription>
          </CardHeader>
          <CardContent>
            {!summary ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {report.status === "processing" 
                    ? "AI summary is being generated. This may take a few moments..."
                    : "No AI summary available yet"}
                </p>
                <Button onClick={handleRegenerate}>Generate Summary</Button>
              </div>
            ) : (
              <Tabs defaultValue="findings" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="findings">Key Findings</TabsTrigger>
                  <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="findings" className="space-y-4">
                  <div className="space-y-3">
                    {summary.key_findings?.map((finding, i) => (
                      <div key={i} className="flex gap-3 p-3 border rounded-lg">
                        <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{finding}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reasoning" className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    {summary.reasoning_steps && typeof summary.reasoning_steps === 'object' ? (
                      <div className="space-y-4">
                        {Object.entries(summary.reasoning_steps).map(([key, value], i) => (
                          <div key={i} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                                {i + 1}
                              </span>
                              {key}
                            </h4>
                            <p className="text-sm text-muted-foreground">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">{summary.full_summary}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-3">
                    {summary.recommendations?.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-3 border rounded-lg">
                        <List className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}