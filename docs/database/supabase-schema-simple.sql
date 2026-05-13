-- Holy S.H.I.T Database Schema (Simplified)
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  authors JSONB NOT NULL,
  highlights TEXT[] NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_hash TEXT UNIQUE NOT NULL,
  pdf_pages INTEGER NOT NULL,

  -- AI review scores
  morality_score INTEGER CHECK (morality_score BETWEEN 1 AND 100),
  humor_score INTEGER CHECK (humor_score BETWEEN 1 AND 100),
  scientific_score INTEGER CHECK (scientific_score BETWEEN 1 AND 100),
  ai_review_notes TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,

  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  month_year TEXT NOT NULL,

  -- Vote tracking
  vote_count INTEGER DEFAULT 0,
  final_score DECIMAL(10, 4),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'selected'))
);

-- Create indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_month_year ON submissions(month_year);
CREATE INDEX IF NOT EXISTS idx_submissions_pdf_hash ON submissions(pdf_hash);
CREATE INDEX IF NOT EXISTS idx_submissions_final_score ON submissions(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_approved_month ON submissions(month_year, status) WHERE status = 'approved';

-- questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_submission ON questions(submission_id);

-- votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(submission_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_votes_submission ON votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_votes_fingerprint ON votes(fingerprint);
CREATE INDEX IF NOT EXISTS idx_votes_ip ON votes(ip_address);

-- vote_cooldowns table
CREATE TABLE IF NOT EXISTS vote_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  ip_address INET NOT NULL,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cooldown_until TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cooldowns_fingerprint_until ON vote_cooldowns(fingerprint, cooldown_until);
CREATE INDEX IF NOT EXISTS idx_cooldowns_cleanup ON vote_cooldowns(cooldown_until);

-- selected_papers table
CREATE TABLE IF NOT EXISTS selected_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  month_year TEXT NOT NULL,
  rank INTEGER NOT NULL,
  final_score DECIMAL(10, 4) NOT NULL,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(submission_id),
  UNIQUE(month_year, rank)
);

CREATE INDEX IF NOT EXISTS idx_selected_papers_month ON selected_papers(month_year, rank);

-- ip_blocks table
CREATE TABLE IF NOT EXISTS ip_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_ip_blocks_ip_until ON ip_blocks(ip_address, blocked_until);

-- submission_order_cache table
CREATE TABLE IF NOT EXISTS submission_order_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL,
  order_seed INTEGER NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(month_year, valid_until)
);

CREATE INDEX IF NOT EXISTS idx_order_cache_month_valid ON submission_order_cache(month_year, valid_until);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for now (we'll use service role key in API)
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE vote_cooldowns DISABLE ROW LEVEL SECURITY;
ALTER TABLE selected_papers DISABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE submission_order_cache DISABLE ROW LEVEL SECURITY;
