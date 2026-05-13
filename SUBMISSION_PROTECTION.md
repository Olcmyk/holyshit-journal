# 投稿防护机制

## 概述
为防止恶意刷投稿，投稿系统实现了与投票系统相同的多层防护机制。

## 防护措施

### 1. IP 封禁检查
- 在处理投稿请求前，首先检查 IP 是否在封禁列表中
- 如果 IP 被封禁，返回剩余封禁时间和封禁原因
- 封禁记录存储在 `ip_blocks` 表中

### 2. 速率限制
- **限制规则**：同一 IP 地址在 1 小时内最多投稿 3 次
- **触发条件**：当检测到同一 IP 在过去 1 小时内已有 3 次或以上投稿时
- **处罚措施**：自动封禁该 IP 24 小时
- **封禁原因**：`'短时间内多次投稿'`

### 3. IP 地址记录
- 每次投稿都会记录提交者的 IP 地址
- IP 地址存储在 `submissions` 表的 `ip_address` 字段
- 支持从以下 HTTP 头获取 IP：
  - `x-forwarded-for`（取第一个 IP）
  - `x-real-ip`
  - 默认值：`'unknown'`

## 数据库变更

### submissions 表新增字段
```sql
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_ip_address ON submissions(ip_address);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
```

## 实施步骤

1. **执行数据库迁移**
   - 在 Supabase SQL Editor 中执行 `add_ip_to_submissions.sql`
   - 这会为 submissions 表添加 `ip_address` 字段和相关索引

2. **部署代码**
   - 投稿 API (`app/api/submit/route.ts`) 已更新，包含 IP 检查和速率限制逻辑

3. **测试**
   - 尝试在 1 小时内投稿 4 次，验证第 4 次会被封禁
   - 验证封禁后无法继续投稿
   - 验证封禁信息正确显示剩余时间

## 错误信息

### IP 被封禁
```json
{
  "error": "IP 已被封禁，请 X 小时后再试。原因：短时间内多次投稿"
}
```
HTTP 状态码：403

### 触发速率限制
```json
{
  "error": "检测到异常投稿行为，IP 已被封禁24小时"
}
```
HTTP 状态码：403

## 与投票系统的一致性

投稿和投票使用相同的防护机制：
- ✅ 共享 `ip_blocks` 表
- ✅ 相同的速率限制规则（1小时3次）
- ✅ 相同的封禁时长（24小时）
- ✅ 相同的 IP 提取逻辑

## 注意事项

1. **开发环境测试**
   - 如果需要清除封禁记录进行测试：
     ```sql
     DELETE FROM ip_blocks WHERE ip_address = 'your-ip';
     ```

2. **生产环境监控**
   - 定期检查 `ip_blocks` 表，识别异常 IP
   - 监控投稿频率，调整速率限制阈值

3. **误封处理**
   - 如果正常用户被误封，可以手动删除封禁记录
   - 考虑为特定 IP（如办公网络）设置白名单
