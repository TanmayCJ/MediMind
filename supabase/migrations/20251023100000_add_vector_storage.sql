-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create report_chunks table to store document chunks with embeddings
CREATE TABLE public.report_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embeddings are 1536 dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(report_id, chunk_index)
);

-- Create index for faster vector similarity search
CREATE INDEX report_chunks_embedding_idx ON public.report_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on report_id for faster joins
CREATE INDEX report_chunks_report_id_idx ON public.report_chunks(report_id);

-- Enable Row Level Security
ALTER TABLE public.report_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view chunks of their own reports
CREATE POLICY "Users can view chunks of own reports"
  ON public.report_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_chunks.report_id
      AND reports.user_id = auth.uid()
    )
  );

-- RLS Policy: System can insert chunks (via edge functions)
CREATE POLICY "System can insert chunks"
  ON public.report_chunks FOR INSERT
  WITH CHECK (true);

-- RLS Policy: System can delete chunks
CREATE POLICY "System can delete chunks"
  ON public.report_chunks FOR DELETE
  USING (true);

-- Function to search similar chunks using vector similarity
CREATE OR REPLACE FUNCTION public.search_similar_chunks(
  query_embedding vector(1536),
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
