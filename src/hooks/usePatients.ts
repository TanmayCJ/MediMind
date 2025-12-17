import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { VirtualPatient, PatientReportSummary } from '@/types/patient';
import { groupReportsByPatient } from '@/lib/patientUtils';
import { toast } from 'sonner';

export function usePatients() {
  const [patients, setPatients] = useState<VirtualPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPatientsData();
    }
  }, [user]);

  const fetchPatientsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reports
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch all summaries
      const { data: summaries, error: summariesError } = await supabase
        .from('summaries')
        .select('*');

      if (summariesError) throw summariesError;

      // Create summaries map
      const summariesMap = new Map<string, PatientReportSummary>();
      summaries?.forEach((s) => {
        summariesMap.set(s.report_id, {
          id: s.id,
          keyFindings: s.key_findings || [],
          recommendations: s.recommendations || [],
          fullSummary: s.full_summary || '',
          reasoningSteps: s.reasoning_steps,
          createdAt: s.created_at,
        });
      });

      // Group reports by patient
      const groupedPatients = groupReportsByPatient(reports || [], summariesMap);
      setPatients(groupedPatients);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPatientsData();
  };

  return { patients, loading, error, refetch };
}

export function usePatientProfile(patientId: string | undefined) {
  const [patient, setPatient] = useState<VirtualPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && patientId) {
      fetchPatientData();
    }
  }, [user, patientId]);

  const fetchPatientData = async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);

      const decodedId = decodeURIComponent(patientId);

      // Fetch reports for this patient (by patient_id or patient_name)
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .or(`patient_id.eq.${decodedId},patient_name.ilike.%${decodedId.replace(/-/g, ' ')}%`)
        .order('uploaded_at', { ascending: false });

      if (reportsError) throw reportsError;

      if (!reports || reports.length === 0) {
        // Try a more flexible search
        const { data: allReports, error: allError } = await supabase
          .from('reports')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (allError) throw allError;

        // Find matching patient from all reports
        const matchingReports = allReports?.filter(r => {
          const normalizedPatientId = r.patient_id?.toLowerCase() || '';
          const normalizedPatientName = r.patient_name.toLowerCase().replace(/\s+/g, '-');
          const searchId = decodedId.toLowerCase();
          return normalizedPatientId === searchId || normalizedPatientName === searchId;
        }) || [];

        if (matchingReports.length === 0) {
          setPatient(null);
          return;
        }

        // Proceed with matching reports
        await processReports(matchingReports);
      } else {
        await processReports(reports);
      }
    } catch (err: any) {
      console.error('Error fetching patient:', err);
      setError(err.message);
      toast.error('Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const processReports = async (reports: any[]) => {
    // Get report IDs
    const reportIds = reports.map((r) => r.id);

    // Fetch summaries for these reports
    const { data: summaries, error: summariesError } = await supabase
      .from('summaries')
      .select('*')
      .in('report_id', reportIds);

    if (summariesError) throw summariesError;

    // Create summaries map
    const summariesMap = new Map<string, PatientReportSummary>();
    summaries?.forEach((s) => {
      summariesMap.set(s.report_id, {
        id: s.id,
        keyFindings: s.key_findings || [],
        recommendations: s.recommendations || [],
        fullSummary: s.full_summary || '',
        reasoningSteps: s.reasoning_steps,
        createdAt: s.created_at,
      });
    });

    // Group reports (should result in single patient)
    const groupedPatients = groupReportsByPatient(reports, summariesMap);
    
    if (groupedPatients.length > 0) {
      setPatient(groupedPatients[0]);
    } else {
      setPatient(null);
    }
  };

  const refetch = () => {
    fetchPatientData();
  };

  return { patient, loading, error, refetch };
}

export function useReportComparison(reportId1: string | null, reportId2: string | null) {
  const [comparison, setComparison] = useState<{
    report1: any;
    report2: any;
    summary1: PatientReportSummary | null;
    summary2: PatientReportSummary | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportId1 && reportId2) {
      fetchComparison();
    } else {
      setComparison(null);
    }
  }, [reportId1, reportId2]);

  const fetchComparison = async () => {
    if (!reportId1 || !reportId2) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch both reports
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .in('id', [reportId1, reportId2]);

      if (reportsError) throw reportsError;

      // Fetch summaries
      const { data: summaries, error: summariesError } = await supabase
        .from('summaries')
        .select('*')
        .in('report_id', [reportId1, reportId2]);

      if (summariesError) throw summariesError;

      const report1 = reports?.find((r) => r.id === reportId1);
      const report2 = reports?.find((r) => r.id === reportId2);
      const summary1Data = summaries?.find((s) => s.report_id === reportId1);
      const summary2Data = summaries?.find((s) => s.report_id === reportId2);

      const summary1: PatientReportSummary | null = summary1Data
        ? {
            id: summary1Data.id,
            keyFindings: summary1Data.key_findings || [],
            recommendations: summary1Data.recommendations || [],
            fullSummary: summary1Data.full_summary || '',
            reasoningSteps: summary1Data.reasoning_steps,
            createdAt: summary1Data.created_at,
          }
        : null;

      const summary2: PatientReportSummary | null = summary2Data
        ? {
            id: summary2Data.id,
            keyFindings: summary2Data.key_findings || [],
            recommendations: summary2Data.recommendations || [],
            fullSummary: summary2Data.full_summary || '',
            reasoningSteps: summary2Data.reasoning_steps,
            createdAt: summary2Data.created_at,
          }
        : null;

      setComparison({
        report1,
        report2,
        summary1,
        summary2,
      });
    } catch (err: any) {
      console.error('Error fetching comparison:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { comparison, loading, error };
}
