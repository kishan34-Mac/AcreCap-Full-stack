-- Rename columns to snake_case if they exist with camelCase or other names
-- This migration handles renaming columns to match the updated schema

DO $$ BEGIN
  -- Rename businessName to business_name if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'businessName') THEN
    ALTER TABLE public.submissions RENAME COLUMN "businessName" TO business_name;
  END IF;

  -- Rename businessType to business_type if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'businessType') THEN
    ALTER TABLE public.submissions RENAME COLUMN "businessType" TO business_type;
  END IF;

  -- Rename annualTurnover to annual_turnover if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'annualTurnover') THEN
    ALTER TABLE public.submissions RENAME COLUMN "annualTurnover" TO annual_turnover;
  END IF;

  -- Rename yearsInBusiness to years_in_business if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'yearsInBusiness') THEN
    ALTER TABLE public.submissions RENAME COLUMN "yearsInBusiness" TO years_in_business;
  END IF;

  -- Rename loanAmount to loan_amount if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'loanAmount') THEN
    ALTER TABLE public.submissions RENAME COLUMN "loanAmount" TO loan_amount;
  END IF;

  -- Rename loanPurpose to loan_purpose if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'loanPurpose') THEN
    ALTER TABLE public.submissions RENAME COLUMN "loanPurpose" TO loan_purpose;
  END IF;

  -- Rename panNumber to pan_number if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'panNumber') THEN
    ALTER TABLE public.submissions RENAME COLUMN "panNumber" TO pan_number;
  END IF;

  -- Rename gstNumber to gst_number if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'gstNumber') THEN
    ALTER TABLE public.submissions RENAME COLUMN "gstNumber" TO gst_number;
  END IF;

  -- Handle potential typo "busssiness_name" to "business_name"
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'busssiness_name') THEN
    ALTER TABLE public.submissions RENAME COLUMN busssiness_name TO business_name;
  END IF;

END $$;