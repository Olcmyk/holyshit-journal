-- Supabase Storage Configuration for submissions-pdfs bucket
-- Run this SQL in your Supabase SQL Editor

-- 1. Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions-pdfs', 'submissions-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (if any)
DROP POLICY IF EXISTS "Public can read PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete PDFs" ON storage.objects;

-- 4. Create policy for public read access
CREATE POLICY "Public can read PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'submissions-pdfs');

-- 5. Create policy for service role to upload
CREATE POLICY "Service role can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions-pdfs'
  AND (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role')
);

-- 6. Create policy for service role to update
CREATE POLICY "Service role can update PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'submissions-pdfs'
  AND (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role')
);

-- 7. Create policy for service role to delete
CREATE POLICY "Service role can delete PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'submissions-pdfs'
  AND (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role')
);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
