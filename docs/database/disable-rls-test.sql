-- 临时禁用RLS来测试（仅用于调试）
-- 警告：这会让任何人都能访问所有数据！

ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- 测试完成后，记得重新启用：
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
