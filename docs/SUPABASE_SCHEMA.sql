-- ==============================================================================
-- PERSONAL STUDY VAULT - DATABASE SCHEMA & RLS SETUP FOR SUPABASE (PostgreSQL)
-- File: docs/SUPABASE_SCHEMA.sql
-- Description: Run this script directly in the Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE 1: sources
-- Manages original uploaded exam papers, test documents, and handwritten notes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_path TEXT,                         -- Storage path inside 'sources' bucket
    subject TEXT,                           -- e.g. 'Mathematics', 'Physics', 'Chemistry', 'IELTS'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date TIMESTAMPTZ,                   -- Assignment deadline or scheduled exam date
    file_size TEXT,                         -- Formatted size, e.g. '4.2 MB'
    extracted_count INT DEFAULT 0,          -- Count of snippets extracted into Problem Vault
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 2: problems
-- Manages extracted/cropped difficult questions in the Problem Vault
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.sources(id) ON DELETE CASCADE,
    image_path TEXT,                        -- Storage path inside 'problem_snippets' bucket
    tags TEXT[] DEFAULT '{}',               -- Array of tags, e.g. ARRAY['Mathematics', 'Advanced', 'Geometry']
    note_text TEXT,                         -- Key insight, mistake note, or solution summary
    anki_exported BOOLEAN DEFAULT FALSE,    -- Flag indicating if synced/exported to Anki
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_sources_due_date ON public.sources(due_date);
CREATE INDEX IF NOT EXISTS idx_sources_status ON public.sources(status);
CREATE INDEX IF NOT EXISTS idx_sources_subject ON public.sources(subject);

CREATE INDEX IF NOT EXISTS idx_problems_source_id ON public.problems(source_id);
-- GIN Index for rapid array filtering: tags @> ARRAY['Mathematics']
CREATE INDEX IF NOT EXISTS idx_problems_tags ON public.problems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_problems_anki_exported ON public.problems(anki_exported);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on both tables
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Policy for Single User / Personal Vault (Using Supabase Anon Key)
-- Allows full access (SELECT, INSERT, UPDATE, DELETE) for the client application
CREATE POLICY "Allow anon full access to sources"
ON public.sources
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon full access to problems"
ON public.problems
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC TRIGGER: Sync extracted_count on sources
-- Automatically increments/decrements sources.extracted_count when a problem is added/removed
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_source_extracted_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.sources
        SET extracted_count = extracted_count + 1
        WHERE id = NEW.source_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.sources
        SET extracted_count = GREATEST(extracted_count - 1, 0)
        WHERE id = OLD.source_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_extracted_count ON public.problems;
CREATE TRIGGER trg_update_extracted_count
AFTER INSERT OR DELETE ON public.problems
FOR EACH ROW
EXECUTE FUNCTION public.update_source_extracted_count();

-- ==============================================================================
-- STORAGE BUCKETS SETUP (Run once in Supabase SQL Editor)
-- Creates the required storage buckets for physical files
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('sources', 'sources', true),
    ('problem_snippets', 'problem_snippets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies (Allow client uploads and reads)
CREATE POLICY "Allow public read on sources bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'sources');

CREATE POLICY "Allow public upload on sources bucket"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'sources');

CREATE POLICY "Allow public read on problem_snippets bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'problem_snippets');

CREATE POLICY "Allow public upload on problem_snippets bucket"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'problem_snippets');
