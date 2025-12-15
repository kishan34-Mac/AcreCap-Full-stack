-- Ensure required extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the submissions table to store application data
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  businessName text NOT NULL,
  businessType text NOT NULL,
  annualTurnover text NOT NULL,
  yearsInBusiness text NOT NULL,
  loanAmount text NOT NULL,
  loanPurpose text NOT NULL,
  tenure text NOT NULL,
  panNumber text NULL,
  gstNumber text NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist using pg_catalog.pg_policy (Postgres system catalog)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'submissions' AND p.polname = 'Allow public read submissions'
  ) THEN
    CREATE POLICY "Allow public read submissions"
      ON public.submissions
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'submissions' AND p.polname = 'Allow public insert submissions'
  ) THEN
    CREATE POLICY "Allow public insert submissions"
      ON public.submissions
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Helpful index for sorting/filtering
CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON public.submissions (created_at);