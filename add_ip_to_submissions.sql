-- 为 submissions 表添加 ip_address 字段
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_ip_address ON submissions(ip_address);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- 为现有记录设置默认值
UPDATE submissions
SET ip_address = 'unknown'
WHERE ip_address IS NULL;
