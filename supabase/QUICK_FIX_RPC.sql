-- ============================================================
-- QUICK FIX: Add search_similar_chunks function
-- Run this in Supabase SQL Editor if you get 500 errors
-- ============================================================

-- Function to search similar chunks using vector similarity (RAG)
-- Updated for Gemini embeddings (768 dimensions)
CREATE OR REPLACE FUNCTION public.search_similar_chunks(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_report_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  report_id uuid,
  content text,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    report_chunks.id,
    report_chunks.report_id,
    report_chunks.content,
    report_chunks.chunk_index,
    1 - (report_chunks.embedding <=> query_embedding) as similarity
  FROM public.report_chunks
  WHERE 
    (filter_report_id IS NULL OR report_chunks.report_id = filter_report_id)
    AND 1 - (report_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY report_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Verify it was created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'search_similar_chunks';
