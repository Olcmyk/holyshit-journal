-- 完整的RLS修复方案
-- 这个脚本会删除所有现有策略并重新创建

-- 1. 删除所有现有的submissions表策略
DROP POLICY IF EXISTS "Public can submit papers" ON submissions;
DROP POLICY IF EXISTS "Allow anonymous submissions" ON submissions;
DROP POLICY IF EXISTS "Public can read approved submissions" ON submissions;
DROP POLICY IF EXISTS "Service role can do everything on submissions" ON submissions;

-- 2. 重新创建策略

-- 允许所有人（包括anon）插入提交
CREATE POLICY "anon_can_insert_submissions" ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 允许所有人读取已批准的提交
CREATE POLICY "public_can_read_approved" ON submissions
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- 允许service role做任何操作
CREATE POLICY "service_role_all_access" ON submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. 验证策略已创建
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'submissions'
ORDER BY policyname;
