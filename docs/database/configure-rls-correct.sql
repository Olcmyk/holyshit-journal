-- 完整的RLS配置方案（经过测试）
-- 这个脚本会正确配置submissions表的RLS策略

-- 步骤1：先启用RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 步骤2：删除所有现有策略
DROP POLICY IF EXISTS "anon_can_insert_submissions" ON public.submissions;
DROP POLICY IF EXISTS "public_can_read_approved" ON public.submissions;
DROP POLICY IF EXISTS "service_role_all_access" ON public.submissions;
DROP POLICY IF EXISTS "Public can submit papers" ON public.submissions;
DROP POLICY IF EXISTS "Allow anonymous submissions" ON public.submissions;
DROP POLICY IF EXISTS "Public can read approved submissions" ON public.submissions;
DROP POLICY IF EXISTS "Service role can do everything on submissions" ON public.submissions;

-- 步骤3：创建新的策略

-- 策略1：允许anon角色插入（用于投稿）
CREATE POLICY "enable_insert_for_anon"
ON public.submissions
FOR INSERT
TO anon
WITH CHECK (true);

-- 策略2：允许authenticated角色插入（如果将来需要登录功能）
CREATE POLICY "enable_insert_for_authenticated"
ON public.submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 策略3：允许所有人读取已批准的投稿
CREATE POLICY "enable_read_approved_for_all"
ON public.submissions
FOR SELECT
TO anon, authenticated
USING (status IN ('approved', 'selected'));

-- 策略4：service_role可以做任何操作（用于API后端）
CREATE POLICY "enable_all_for_service_role"
ON public.submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 步骤4：验证策略已创建
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'submissions'
ORDER BY policyname;

-- 步骤5：验证RLS已启用
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'submissions';
