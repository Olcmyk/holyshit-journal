-- 查看 submissions 表的所有策略
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'submissions'
ORDER BY policyname;

-- 检查表的 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'submissions';
