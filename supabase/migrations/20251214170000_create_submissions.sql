-- Create the submissions table to store application data
-- Ensure the table exists in the public schema and is accessible via PostgREST

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

-- Allow read access to anyone (anon & authenticated)
CREATE POLICY IF NOT EXISTS "Allow public read submissions"
  ON public.submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow inserts from anyone (anon & authenticated) so unauthenticated users can submit
CREATE POLICY IF NOT EXISTS "Allow public insert submissions"
  ON public.submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Helpful index for sorting/filtering
CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON public.submissions (created_at);