// Summary Components - Dual View (Patient & Doctor)
export { PatientSummaryCard, convertToPatientSummary } from './PatientSummaryCard';
export type { PatientSummary, PatientFinding } from './PatientSummaryCard';

export { DoctorSummaryCard, convertToDoctorSummary } from './DoctorSummaryCard';
export type { 
  DoctorSummary, 
  ClinicalFinding, 
  RedFlag, 
  PrescribingConsideration, 
  DrugInteraction 
} from './DoctorSummaryCard';
