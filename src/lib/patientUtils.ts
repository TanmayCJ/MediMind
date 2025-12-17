import { 
  VirtualPatient, 
  PatientReport, 
  PatientReportSummary, 
  ComparisonResult, 
  TimelineEvent, 
  ChartDataPoint,
  PatientInsights 
} from '@/types/patient';
import { 
  FileText, 
  Microscope, 
  Activity, 
  Scan, 
  TestTube, 
  FileQuestion,
  type LucideIcon 
} from 'lucide-react';

// Generate a consistent patient ID for URL routing
export function generatePatientId(patientName: string, patientId?: string | null): string {
  if (patientId) {
    return encodeURIComponent(patientId);
  }
  // Create a hash-like ID from patient name for consistent routing
  return encodeURIComponent(patientName.toLowerCase().replace(/\s+/g, '-'));
}

// Decode patient ID from URL
export function decodePatientId(encodedId: string): string {
  return decodeURIComponent(encodedId);
}

// Group reports by patient to create virtual patient profiles
export function groupReportsByPatient(
  reports: any[], 
  summaries: Map<string, PatientReportSummary>
): VirtualPatient[] {
  const patientMap = new Map<string, VirtualPatient>();

  reports.forEach((report) => {
    const patientKey = report.patient_id || report.patient_name;
    const patientId = generatePatientId(report.patient_name, report.patient_id);
    
    const patientReport: PatientReport = {
      id: report.id,
      reportType: report.report_type,
      fileName: report.file_name,
      fileUrl: report.file_url,
      uploadedAt: report.uploaded_at,
      status: report.status,
      patientName: report.patient_name,
      patientId: report.patient_id,
      summary: summaries.get(report.id),
    };

    if (patientMap.has(patientKey)) {
      const existing = patientMap.get(patientKey)!;
      existing.reports.push(patientReport);
      existing.reportCount++;
      
      // Update first/last visit
      if (new Date(report.uploaded_at) < new Date(existing.firstVisit)) {
        existing.firstVisit = report.uploaded_at;
      }
      if (new Date(report.uploaded_at) > new Date(existing.lastVisit)) {
        existing.lastVisit = report.uploaded_at;
        existing.latestStatus = report.status;
      }
      
      // Add unique report type
      if (!existing.reportTypes.includes(report.report_type)) {
        existing.reportTypes.push(report.report_type);
      }
    } else {
      patientMap.set(patientKey, {
        id: patientId,
        patientId: report.patient_id,
        patientName: report.patient_name,
        reportCount: 1,
        firstVisit: report.uploaded_at,
        lastVisit: report.uploaded_at,
        reportTypes: [report.report_type],
        latestStatus: report.status,
        reports: [patientReport],
      });
    }
  });

  // Sort reports within each patient by date (newest first)
  patientMap.forEach((patient) => {
    patient.reports.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  });

  return Array.from(patientMap.values());
}

// Compare findings between two reports
export function compareFindings(
  findings1: string[], 
  findings2: string[]
): { added: string[]; removed: string[]; unchanged: string[] } {
  const set1 = new Set(findings1.map(f => f.toLowerCase().trim()));
  const set2 = new Set(findings2.map(f => f.toLowerCase().trim()));

  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  // Find items in findings2 not in findings1 (added)
  findings2.forEach(f => {
    if (!set1.has(f.toLowerCase().trim())) {
      added.push(f);
    }
  });

  // Find items in findings1 not in findings2 (removed)
  findings1.forEach(f => {
    if (!set2.has(f.toLowerCase().trim())) {
      removed.push(f);
    }
  });

  // Find items in both (unchanged)
  findings1.forEach(f => {
    if (set2.has(f.toLowerCase().trim())) {
      unchanged.push(f);
    }
  });

  return { added, removed, unchanged };
}

// Generate full comparison result between two reports
export function generateComparisonResult(
  report1: PatientReport,
  report2: PatientReport
): ComparisonResult {
  const findings1 = report1.summary?.keyFindings || [];
  const findings2 = report2.summary?.keyFindings || [];
  const recommendations1 = report1.summary?.recommendations || [];
  const recommendations2 = report2.summary?.recommendations || [];

  return {
    report1,
    report2,
    findingsDiff: compareFindings(findings1, findings2),
    recommendationsDiff: compareFindings(recommendations1, recommendations2),
  };
}

// Extract insights from multiple summaries
export function extractInsightsFromSummaries(
  reports: PatientReport[]
): PatientInsights {
  const findingsCount = new Map<string, number>();
  const recommendationsCount = new Map<string, number>();
  const reportTypeFrequency: Record<string, number> = {};
  let totalFindings = 0;
  let totalRecommendations = 0;

  reports.forEach((report) => {
    // Count report types
    reportTypeFrequency[report.reportType] = (reportTypeFrequency[report.reportType] || 0) + 1;

    if (report.summary) {
      // Count findings
      report.summary.keyFindings.forEach((finding) => {
        const key = finding.toLowerCase().trim();
        findingsCount.set(key, (findingsCount.get(key) || 0) + 1);
        totalFindings++;
      });

      // Count recommendations
      report.summary.recommendations.forEach((rec) => {
        const key = rec.toLowerCase().trim();
        recommendationsCount.set(key, (recommendationsCount.get(key) || 0) + 1);
        totalRecommendations++;
      });
    }
  });

  // Find recurring items (appearing more than once)
  const recurringFindings = Array.from(findingsCount.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([finding]) => finding);

  const commonRecommendations = Array.from(recommendationsCount.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([rec]) => rec);

  return {
    recurringFindings,
    commonRecommendations,
    reportTypeFrequency,
    totalFindings,
    totalRecommendations,
  };
}

// Get consistent color for report type badges
export function getReportTypeColor(type: string): string {
  const colors: Record<string, string> = {
    radiology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pathology: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    mri: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    ct_scan: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    lab_report: 'bg-green-500/20 text-green-400 border-green-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return colors[type] || colors.other;
}

// Get icon for report type
export function getReportTypeIcon(type: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    radiology: FileText,
    pathology: Microscope,
    mri: Activity,
    ct_scan: Scan,
    lab_report: TestTube,
    other: FileQuestion,
  };
  return icons[type] || icons.other;
}

// Format report type for display
export function formatReportType(type: string): string {
  const formats: Record<string, string> = {
    radiology: 'Radiology',
    pathology: 'Pathology',
    mri: 'MRI',
    ct_scan: 'CT Scan',
    lab_report: 'Lab Report',
    other: 'Other',
  };
  return formats[type] || type;
}

// Format patient timeline from reports and summaries
export function formatPatientTimeline(
  reports: PatientReport[]
): TimelineEvent[] {
  return reports
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map((report) => ({
      id: report.id,
      date: report.uploadedAt,
      type: report.reportType,
      title: `${formatReportType(report.reportType)} Report`,
      description: report.fileName,
      reportId: report.id,
      status: report.status,
      keyFinding: report.summary?.keyFindings?.[0],
    }));
}

// Calculate report frequency by month for charts
export function calculateReportFrequency(reports: PatientReport[]): ChartDataPoint[] {
  const monthCounts = new Map<string, number>();

  reports.forEach((report) => {
    const date = new Date(report.uploadedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  // Sort by date and format for chart
  return Array.from(monthCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      return { month: monthName, count };
    });
}

// Calculate report types over time for stacked area chart
export function calculateReportTypesOverTime(reports: PatientReport[]): ChartDataPoint[] {
  const monthData = new Map<string, Record<string, number>>();

  reports.forEach((report) => {
    const date = new Date(report.uploadedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthData.has(monthKey)) {
      monthData.set(monthKey, {});
    }
    
    const data = monthData.get(monthKey)!;
    data[report.reportType] = (data[report.reportType] || 0) + 1;
  });

  return Array.from(monthData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, types]) => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      return { month: monthName, ...types, count: Object.values(types).reduce((a, b) => a + b, 0) };
    });
}

// Generate initials from patient name
export function getPatientInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    uploaded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || colors.uploaded;
}

// Filter patients based on filters
export function filterPatients(
  patients: VirtualPatient[],
  filters: {
    searchQuery: string;
    reportTypes: string[];
    sortBy: 'name' | 'lastVisit' | 'reportCount';
    sortOrder: 'asc' | 'desc';
  }
): VirtualPatient[] {
  let filtered = [...patients];

  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.patientName.toLowerCase().includes(query) ||
        p.patientId?.toLowerCase().includes(query)
    );
  }

  // Report type filter
  if (filters.reportTypes.length > 0) {
    filtered = filtered.filter((p) =>
      p.reportTypes.some((t) => filters.reportTypes.includes(t))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case 'name':
        comparison = a.patientName.localeCompare(b.patientName);
        break;
      case 'lastVisit':
        comparison = new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        break;
      case 'reportCount':
        comparison = b.reportCount - a.reportCount;
        break;
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}
