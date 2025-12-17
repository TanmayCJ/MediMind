-- Migration: Add dual-view summary columns (Patient View & Doctor View)
-- This enables storing both patient-friendly and clinical professional summaries

-- Add patient_summary column for B2C (patient-friendly) view
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS patient_summary JSONB;

-- Add doctor_summary column for B2B (clinical professional) view
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS doctor_summary JSONB;

-- Add timestamp for when dual views were generated
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS view_generated_at TIMESTAMPTZ;

-- Add sources column if it doesn't exist (for RAG citations)
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS sources JSONB;

-- Add rag_context_used column if it doesn't exist
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS rag_context_used UUID[];

-- Comment on new columns
COMMENT ON COLUMN public.summaries.patient_summary IS 'Patient-friendly summary with simple language, emojis, and color-coded severity';
COMMENT ON COLUMN public.summaries.doctor_summary IS 'Clinical professional summary with medical terminology, red flags, and prescribing insights';
COMMENT ON COLUMN public.summaries.view_generated_at IS 'Timestamp when dual-view summaries were generated';

-- Example patient_summary structure:
-- {
--   "overview": "What your results mean...",
--   "findings": [
--     {
--       "title": "Your Blood Sugar",
--       "status": "needs_attention", // good, needs_attention, urgent
--       "emoji": "⚠️",
--       "simple_explanation": "Your blood sugar is a bit higher than normal.",
--       "what_it_means": "This could mean you need to watch your diet more closely.",
--       "action_items": ["Talk to your doctor about diet changes", "Consider more exercise"]
--     }
--   ],
--   "questions_for_doctor": ["Should I change my diet?", "Do I need medication?"],
--   "lifestyle_tips": ["Eat more vegetables", "Walk 30 minutes daily"],
--   "follow_up_needed": true,
--   "urgency_level": "moderate" // low, moderate, high
-- }

-- Example doctor_summary structure:
-- {
--   "clinical_impression": "Patient presents with elevated HbA1c indicating...",
--   "key_findings": [
--     {
--       "finding": "Elevated HbA1c (7.2%)",
--       "clinical_significance": "Indicative of suboptimal glycemic control",
--       "reference_range": "4.0-5.6%",
--       "icd10_code": "R73.09",
--       "snomed_code": "166922008"
--     }
--   ],
--   "red_flags": [
--     {
--       "flag": "Rapid eGFR decline",
--       "urgency": "high",
--       "recommended_action": "Immediate nephrology referral",
--       "rationale": "30% decline in 6 months suggests accelerated CKD progression"
--     }
--   ],
--   "prescribing_considerations": [
--     {
--       "medication_class": "SGLT2 inhibitors",
--       "recommendation": "Consider addition of empagliflozin",
--       "rationale": "Cardioprotective and nephroprotective benefits",
--       "contraindications": ["eGFR <20", "History of DKA"],
--       "monitoring": ["eGFR q3m", "Ketones if symptomatic"]
--     }
--   ],
--   "drug_interactions": [
--     {
--       "interaction": "Metformin + Contrast media",
--       "severity": "moderate",
--       "recommendation": "Hold metformin 48h before/after contrast procedures"
--     }
--   ],
--   "differential_diagnosis": ["Type 2 DM with nephropathy", "Secondary diabetes"],
--   "recommended_tests": ["Urine albumin-creatinine ratio", "Lipid panel", "Retinal exam"],
--   "follow_up_interval": "4-6 weeks",
--   "specialist_referrals": ["Nephrology", "Ophthalmology (diabetic screening)"]
-- }
