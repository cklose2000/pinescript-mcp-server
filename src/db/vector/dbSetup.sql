-- pgvector setup script for Supabase
-- This script creates the pgvector extension and necessary functions
-- Run this in the Supabase SQL editor

-- Function to check if pgvector extension exists
CREATE OR REPLACE FUNCTION public.check_pgvector()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'vector'
  );
END;
$$;

-- Function to create pgvector extension if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_pgvector_extension()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'vector'
  ) THEN
    CREATE EXTENSION vector;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create pgvector extension: %', SQLERRM;
    RETURN false;
END;
$$;

-- Function to create embeddings table with proper structure
CREATE OR REPLACE FUNCTION public.create_embeddings_table(
  table_name text,
  embedding_column text DEFAULT 'embedding'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  create_table_query text;
  create_index_query text;
BEGIN
  -- Generate the query to create the table
  create_table_query := format('
    CREATE TABLE public.%I (
      id text PRIMARY KEY,
      content text NOT NULL,
      %I vector(1536),
      metadata jsonb DEFAULT ''{}''::jsonb,
      created_at timestamp with time zone DEFAULT timezone(''utc''::text, now()),
      updated_at timestamp with time zone DEFAULT timezone(''utc''::text, now())
    );
  ', table_name, embedding_column);
  
  -- Generate the query to create the index
  create_index_query := format('
    CREATE INDEX IF NOT EXISTS %I ON public.%I 
    USING ivfflat (%I vector_cosine_ops)
    WITH (lists = 100);
  ', table_name || '_vector_idx', table_name, embedding_column);
  
  -- Execute the queries
  EXECUTE create_table_query;
  EXECUTE create_index_query;
  
  -- Enable RLS
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
  
  -- Create policies
  EXECUTE format('
    CREATE POLICY "Enable read access for all users" ON public.%I
    FOR SELECT USING (true);
  ', table_name);
  
  EXECUTE format('
    CREATE POLICY "Enable insert for authenticated users only" ON public.%I
    FOR INSERT WITH CHECK (auth.role() = ''authenticated'');
  ', table_name);
  
  EXECUTE format('
    CREATE POLICY "Enable update for authenticated users only" ON public.%I
    FOR UPDATE USING (auth.role() = ''authenticated'');
  ', table_name);
  
  EXECUTE format('
    CREATE POLICY "Enable delete for authenticated users only" ON public.%I
    FOR DELETE USING (auth.role() = ''authenticated'');
  ', table_name);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create embeddings table: %', SQLERRM;
    RETURN false;
END;
$$;

-- Function to search for similar embeddings
CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 10,
  table_name text DEFAULT 'template_embeddings',
  embedding_column text DEFAULT 'embedding'
)
RETURNS TABLE (
  id text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text text;
BEGIN
  query_text := format('
    SELECT
      id,
      content,
      metadata,
      1 - (%I <=> $1) as similarity
    FROM
      public.%I
    WHERE
      1 - (%I <=> $1) > $2
    ORDER BY
      similarity DESC
    LIMIT $3;
  ', embedding_column, table_name, embedding_column);
  
  RETURN QUERY EXECUTE query_text USING query_embedding, match_threshold, match_count;
END;
$$;

-- Create embeddings table if it doesn't exist yet
SELECT public.create_pgvector_extension();
SELECT public.create_embeddings_table('template_embeddings', 'embedding'); 