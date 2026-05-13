-- Fix submissions table RLS to allow public submissions
-- This allows anonymous users to submit papers

-- Add policy to allow anyone to insert submissions
CREATE POLICY "Public can submit papers" ON submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'submissions';
