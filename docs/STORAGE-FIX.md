# Supabase Storage 上传错误修复指南

## 错误信息

```
Upload error: [Error [StorageApiError]: new row violates row-level security policy]
status: 400, statusCode: '403'
```

## 问题原因

Supabase Storage的行级安全策略（RLS）阻止了文件上传。这是因为：
1. Storage bucket的RLS策略没有正确配置
2. Service role没有上传权限

## 解决方案

### 方法1：通过Supabase Dashboard（推荐）

#### 步骤1：检查Bucket是否存在

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 左侧菜单点击 **Storage**
4. 查看是否有名为 `submissions-pdfs` 的bucket

#### 步骤2：创建Bucket（如果不存在）

1. 点击 **New bucket**
2. 名称：`submissions-pdfs`
3. **Public bucket**: ✅ 勾选（允许公开读取）
4. 点击 **Create bucket**

#### 步骤3：配置Storage策略

1. 在Storage页面，点击 **Policies** 标签
2. 找到 `submissions-pdfs` bucket
3. 点击 **New policy**

**创建以下4个策略：**

##### 策略1：公开读取
- **Policy name**: `Public can read PDFs`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
  ```sql
  bucket_id = 'submissions-pdfs'
  ```

##### 策略2：Service role上传
- **Policy name**: `Service role can upload PDFs`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'submissions-pdfs'
  ```
- **WITH CHECK**:
  ```sql
  bucket_id = 'submissions-pdfs'
  ```

##### 策略3：Service role更新
- **Policy name**: `Service role can update PDFs`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
  ```sql
  bucket_id = 'submissions-pdfs'
  ```

##### 策略4：Service role删除
- **Policy name**: `Service role can delete PDFs`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  bucket_id = 'submissions-pdfs'
  ```

### 方法2：通过SQL Editor（快速）

1. 在Supabase Dashboard，点击左侧 **SQL Editor**
2. 点击 **New query**
3. 复制并粘贴 `docs/database/supabase-storage-setup.sql` 的内容
4. 点击 **Run** 执行

### 方法3：简化版（最快）

如果上面的方法太复杂，可以使用这个简化的SQL：

```sql
-- 创建bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions-pdfs', 'submissions-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;

-- 创建一个允许所有操作的策略（仅用于开发/测试）
CREATE POLICY "Allow all operations"
ON storage.objects
FOR ALL
USING (bucket_id = 'submissions-pdfs')
WITH CHECK (bucket_id = 'submissions-pdfs');
```

⚠️ **注意**：这个简化版策略允许任何人上传/删除文件，仅适用于开发环境！

## 验证修复

### 1. 检查Bucket配置

在SQL Editor中运行：

```sql
SELECT * FROM storage.buckets WHERE id = 'submissions-pdfs';
```

应该返回：
- `id`: submissions-pdfs
- `name`: submissions-pdfs
- `public`: true

### 2. 检查策略

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

应该看到至少4个策略（SELECT, INSERT, UPDATE, DELETE）

### 3. 测试上传

1. 重启开发服务器（如果还在运行）
2. 访问 http://localhost:3000/submit
3. 尝试上传PDF文件
4. 应该成功上传

## 常见问题

### Q: 为什么需要public bucket？

A: 因为投票页面需要公开访问PDF文件。如果设为private，需要生成签名URL，会增加复杂度。

### Q: Service role是什么？

A: Service role是Supabase的特殊角色，用于服务器端操作。你的API路由使用service role key来绕过RLS。

### Q: 如何检查我的service role key？

在 `.env.local` 文件中检查：
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 这个是关键
```

确保API路由使用的是service role key，而不是anon key。

### Q: 策略配置后还是失败？

1. 检查 `.env.local` 中的 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
2. 重启开发服务器
3. 清除浏览器缓存
4. 检查Supabase项目是否暂停（免费版会自动暂停）

## 安全建议

### 生产环境配置

在生产环境中，应该使用更严格的策略：

```sql
-- 只允许authenticated用户上传
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions-pdfs'
  AND auth.role() = 'authenticated'
);

-- 添加文件大小限制
CREATE POLICY "Limit file size"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions-pdfs'
  AND (storage.foldername(name))[1] = 'submissions'
  AND octet_length(decode(encode(content, 'base64'), 'base64')) < 5242880  -- 5MB
);
```

### 添加速率限制

考虑在API路由中添加上传速率限制，防止滥用。

## 相关文件

- `docs/database/supabase-storage-setup.sql` - 完整的Storage配置SQL
- `app/api/submit/route.ts` - 文件上传API
- `lib/supabase/server.ts` - Supabase客户端配置

## 下一步

配置完成后：
1. ✅ 重启开发服务器
2. ✅ 测试PDF上传
3. ✅ 检查文件是否出现在Storage中
4. ✅ 测试PDF公开访问（通过URL）

如果还有问题，请检查：
- Supabase项目状态（是否暂停）
- API keys是否正确
- 网络连接是否正常
