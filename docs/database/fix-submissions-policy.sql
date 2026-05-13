-- 删除旧策略并创建新的，明确指定 anon 和 authenticated 角色
DROP POLICY IF EXISTS "Public can submit papers" ON submissions;

-- 为匿名用户创建 INSERT 策略
CREATE POLICY "Allow anonymous submissions" ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 验证策略
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'submissions';
