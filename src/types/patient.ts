// Patient Profile Types - Virtual patients aggregated from reports

export interface VirtualPatient {
  id: string; // patient_id or hashed patient_name
  patientId: string | null; // original patient_id
  patientName: string;
  reportCount: number;
  firstVisit: string; // ISO date
  lastVisit: string; // ISO date
  reportTypes: string[]; // unique report types
  latestStatus: string;
  reports: PatientReport[];
}

export interface PatientReport {
  id: string;
  reportType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: string;
  patientName: string;
  patientId: string | null;
  summary?: PatientReportSummary;
}

export interface PatientReportSummary {
  id: string;
  keyFindings: string[];
  recommendations: string[];
  fullSummary: string;
  reasoningSteps: any;
  createdAt: string;
}

export interface ComparisonResult {
  report1: PatientReport;
  report2: PatientReport;
  findingsDiff: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };
  recommendationsDiff: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };
}

export interface PatientFilters {
  searchQuery: string;
  reportTypes: string[];
  dateRange: { start: Date | null; end: Date | null };
  sortBy: 'name' | 'lastVisit' | 'reportCount';
  sortOrder: 'asc' | 'desc';
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description: string;
  reportId: string;
  status: string;
  keyFinding?: string;
}

export interface ChartDataPoint {
  month: string;
  count: number;
  [key: string]: string | number;
}

export interface PatientInsights {
  recurringFindings: string[];
  commonRecommendations: string[];
  reportTypeFrequency: Record<string, number>;
  totalFindings: number;
  totalRecommendations: number;
}
