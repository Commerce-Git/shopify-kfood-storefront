-- Feedback table for customer survey responses
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  favorite_snacks TEXT[] DEFAULT '{}',
  want_next TEXT[] DEFAULT '{}',
  comment TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon key (public feedback form)
CREATE POLICY "Allow public feedback inserts"
  ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only service_role can read (admin dashboard)
CREATE POLICY "Allow service role to read feedback"
  ON feedback
  FOR SELECT
  TO service_role
  USING (true);
