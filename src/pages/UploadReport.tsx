import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UploadReport() {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [reportType, setReportType] = useState("radiology");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-reports')
        .getPublicUrl(fileName);

      // Create report record
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
          patient_name: patientName,
          patient_id: patientId || null,
          report_type: reportType,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          status: 'uploaded',
        }])
        .select()
        .single();

      if (reportError) throw reportError;

      toast.success("Report uploaded successfully!");
      
      // Trigger AI summarization
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-summary', {
        body: { reportId: report.id }
      });

      if (functionError) {
        console.error('Error generating summary:', functionError);
        toast.error("Report uploaded but summary generation failed. Please try again.");
      } else {
        toast.success("AI summary is being generated...");
        navigate(`/summary/${report.id}`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Upload Diagnostic Report</h1>
        <p className="text-muted-foreground">
          Upload a medical report for AI-powered analysis and summarization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>
            Provide patient information and upload the diagnostic report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name *</Label>
                <Input
                  id="patient-name"
                  placeholder="John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-id">Patient ID</Label>
                <Input
                  id="patient-id"
                  placeholder="P-12345"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type *</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                  <SelectItem value="mri">MRI</SelectItem>
                  <SelectItem value="ct_scan">CT Scan</SelectItem>
                  <SelectItem value="lab_report">Lab Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File *</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.dcm"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label htmlFor="file" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, JPG, PNG, or DICOM files
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={uploading || !file}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Generate Summary
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}