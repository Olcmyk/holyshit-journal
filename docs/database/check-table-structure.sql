-- 检查submissions表的完整信息

-- 1. 检查表结构和默认值
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

-- 2. 检查是否有触发器
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'submissions';

-- 3. 检查表的所有者和权限
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'submissions';
