import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EDGE_FUNCTIONS } from "@/config/functions";

type ReportType = Database["public"]["Enums"]["report_type"];

export default function UploadReport() {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [reportType, setReportType] = useState<ReportType>("radiology");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    console.log('🚀 Starting upload process...');
    console.log('📄 File:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('👤 Patient:', patientName, 'Report Type:', reportType);

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('📤 Uploading file to storage:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded to storage successfully');

      const { data: { publicUrl } } = supabase.storage
        .from('medical-reports')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', publicUrl);

      console.log('💾 Creating report record in database...');

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

      if (reportError) {
        console.error('❌ Database insert error:', reportError);
        throw reportError;
      }

      console.log('✅ Report record created with ID:', report.id);

      toast.success("Report uploaded successfully!");
      
      // Call process-document to chunk and create embeddings for RAG
      console.log('📊 Calling process-document edge function for RAG...');
      toast.info("Processing document for enhanced analysis...");
      
      try {
        const { data: processData, error: processError } = await supabase.functions.invoke('process-document', {
          body: { reportId: report.id }
        });

        if (processError) {
          console.warn('⚠️ process-document warning:', processError);
          console.log('ℹ️ Continuing without RAG enhancement');
        } else {
          console.log('✅ Document processed:', processData);
          if (processData?.rag_enabled) {
            toast.success("Document chunked for enhanced RAG retrieval!");
          }
        }
      } catch (procError) {
        console.warn('⚠️ process-document failed, continuing:', procError);
      }
      
      // Generate AI summary
      console.log('🤖 Calling generate-summary-new edge function...');
      toast.info("Generating AI summary...");
      
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke(EDGE_FUNCTIONS.GENERATE_SUMMARY, {
        body: { reportId: report.id }
      });

      if (summaryError) {
        console.error('❌ generate-summary error:', summaryError);
        console.error('Error details:', JSON.stringify(summaryError, null, 2));
        toast.error("Report uploaded but summary generation failed. Please try again.");
      } else {
        console.log('✅ Summary generated successfully:', summaryData);
        toast.success("AI summary generated successfully!");
        navigate(`/summary/${report.id}`);
      }
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      console.error('Error stack:', error.stack);
      toast.error(error.message || "Failed to upload report");
    } finally {
      setUploading(false);
      console.log('🏁 Upload process completed');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Upload Diagnostic Report
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload a medical report for AI-powered analysis and summarization
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="backdrop-blur-sm bg-card/50 shadow-xl">
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              Provide patient information and upload the diagnostic report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="patient-name">Patient Name *</Label>
                  <Input
                    id="patient-name"
                    placeholder="John Doe"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    className="transition-all focus:scale-[1.02]"
                  />
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="patient-id">Patient ID</Label>
                  <Input
                    id="patient-id"
                    placeholder="P-12345"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="transition-all focus:scale-[1.02]"
                  />
                </motion.div>
              </div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="report-type">Report Type *</Label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
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
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="file">Upload File *</Label>
                <motion.div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive 
                      ? "border-primary bg-primary/5 scale-[1.02]" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01 }}
                  animate={dragActive ? { scale: 1.02 } : { scale: 1 }}
                >
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.dcm"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <AnimatePresence mode="wait">
                      {file ? (
                        <motion.div
                          key="file-selected"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-center gap-3"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Check className="h-6 w-6 text-success" />
                          </motion.div>
                          <FileText className="h-6 w-6 text-primary" />
                          <span className="font-medium">{file.name}</span>
                          <span className="text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="no-file"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          </motion.div>
                          <p className="font-medium">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            PDF, JPG, PNG, or DICOM files
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </label>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" className="w-full shadow-lg" disabled={uploading || !file}>
                    {uploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-4 w-4 mr-2" />
                        </motion.div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Generate Summary
                      </>
                    )}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
