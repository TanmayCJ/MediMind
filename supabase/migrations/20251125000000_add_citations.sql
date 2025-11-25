-- Add citations/sources to summaries table
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rag_context_used TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment explaining the structure
COMMENT ON COLUMN public.summaries.sources IS 'Array of citation objects with structure: {type: "current_report"|"similar_report", report_id: uuid, patient_name: string, relevance: number, snippet: string}';
COMMENT ON COLUMN public.summaries.rag_context_used IS 'Array of report IDs that were used as RAG context for this summary';
