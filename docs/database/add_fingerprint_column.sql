-- Add fingerprint column to submissions table
-- Run this in Supabase SQL Editor

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- Create index for fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_submissions_fingerprint ON submissions(fingerprint);

-- Create index for fingerprint + date queries (for daily limit checks)
CREATE INDEX IF NOT EXISTS idx_submissions_fingerprint_date ON submissions(fingerprint, submitted_at);
