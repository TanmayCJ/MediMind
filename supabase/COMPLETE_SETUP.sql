-- ============================================================
-- MED-MIND AI CORE - COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor in order
-- ============================================================

-- ============================================================
-- PART 1: ENABLE EXTENSIONS
-- ============================================================

-- Enable pgvector for RAG functionality
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- PART 2: CREATE ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('doctor', 'radiologist', 'admin');
CREATE TYPE public.report_type AS ENUM ('radiology', 'pathology', 'mri', 'ct_scan', 'lab_report', 'other');
CREATE TYPE public.report_status AS ENUM ('uploaded', 'processing', 'completed', 'failed');

-- ============================================================
-- PART 3: CREATE TABLES
-- ============================================================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'doctor',
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  report_type report_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  status report_status NOT NULL DEFAULT 'uploaded',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Summaries table (AI-generated analysis)
CREATE TABLE public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE UNIQUE,
  key_findings TEXT[],
  reasoning_steps JSONB,
  recommendations TEXT[],
  full_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report chunks table (for RAG with vector embeddings)
CREATE TABLE public.report_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768), -- Gemini text-embedding-004 produces 768 dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(report_id, chunk_index)
);

-- ============================================================
-- PART 4: CREATE INDEXES
-- ============================================================

-- Vector similarity search index
CREATE INDEX report_chunks_embedding_idx ON public.report_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Report ID index for faster joins
CREATE INDEX report_chunks_report_id_idx ON public.report_chunks(report_id);

-- ============================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_chunks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 6: RLS POLICIES - PROFILES
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- PART 7: RLS POLICIES - REPORTS
-- ============================================================

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PART 8: RLS POLICIES - SUMMARIES
-- ============================================================

CREATE POLICY "Users can view summaries of own reports"
  ON public.summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = summaries.report_id
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert summaries"
  ON public.summaries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update summaries"
  ON public.summaries FOR UPDATE
  USING (true);

-- ============================================================
-- PART 9: RLS POLICIES - REPORT CHUNKS
-- ============================================================

CREATE POLICY "Users can view chunks of own reports"
  ON public.report_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_chunks.report_id
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert chunks"
  ON public.report_chunks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can delete chunks"
  ON public.report_chunks FOR DELETE
  USING (true);

-- ============================================================
-- PART 10: FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'doctor')
  );
  RETURN NEW;
END;
$$;

-- Function to search similar chunks using vector similarity (RAG)
-- Updated for Gemini embeddings (768 dimensions instead of OpenAI's 1536)
CREATE OR REPLACE FUNCTION public.search_similar_chunks(
  query_embedding vector(768),  -- Changed from 1536 to 768 for Gemini
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

-- ============================================================
-- PART 11: TRIGGERS
-- ============================================================

-- Trigger for profiles updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 12: STORAGE BUCKET
-- ============================================================

-- Create storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-reports', 'medical-reports', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART 13: STORAGE POLICIES
-- ============================================================

-- Storage policies for medical reports
CREATE POLICY "Users can upload their own reports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own reports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- SETUP COMPLETE! 🎉
-- ============================================================
-- Next steps:
-- 1. Deploy Edge Functions (generate-summary, process-document)
-- 2. Set environment secrets (OPENAI_API_KEY, LOVABLE_API_KEY)
-- 3. Update frontend .env.local with your Supabase credentials
-- ============================================================
