-- 查看完整的策略定义
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'submissions' AND policyname = 'Public can submit papers';
