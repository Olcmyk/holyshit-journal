-- 检查RLS状态
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'submissions';

-- 如果显示 rls_enabled = true，说明RLS还是启用的
-- 需要再次运行禁用命令：
-- ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
