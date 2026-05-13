# RLS配置指南

## 问题诊断

之前的RLS策略失败的原因：
1. 策略名称可能有冲突（多次创建导致）
2. 策略的角色配置可能不正确
3. 可能缺少某些必要的策略组合

## 正确的RLS配置

### 配置步骤

1. **在Supabase Dashboard执行SQL**
   - 打开 https://zbmssjekxlzjgvedoocs.supabase.co
   - 进入 SQL Editor
   - 复制并执行 `docs/database/configure-rls-correct.sql`

2. **验证配置**
   ```sql
   -- 检查RLS是否启用
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'submissions';
   
   -- 检查策略列表
   SELECT policyname, roles, cmd FROM pg_policies 
   WHERE tablename = 'submissions';
   ```

3. **测试上传功能**
   - 访问 http://localhost:3000
   - 尝试上传一个PDF
   - 如果失败，查看浏览器控制台和Network标签的错误信息

### 策略说明

配置了4个策略：

1. **enable_insert_for_anon** - 允许匿名用户插入（投稿）
   - 角色：anon
   - 操作：INSERT
   - 条件：无条件允许

2. **enable_insert_for_authenticated** - 允许登录用户插入
   - 角色：authenticated
   - 操作：INSERT
   - 条件：无条件允许

3. **enable_read_approved_for_all** - 允许所有人读取已批准的投稿
   - 角色：anon, authenticated
   - 操作：SELECT
   - 条件：status IN ('approved', 'selected')

4. **enable_all_for_service_role** - 允许service_role完全访问
   - 角色：service_role
   - 操作：ALL
   - 条件：无条件允许

### 如果还是失败

如果执行SQL后上传仍然失败，可能的原因：

1. **检查anon key是否正确**
   ```bash
   # 查看.env.local中的key
   grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local
   ```

2. **检查API调用使用的client**
   - 确保使用的是 `createClient(url, anonKey)` 而不是 service key
   - 文件位置：`lib/supabase/client.ts`

3. **查看详细错误**
   - 打开浏览器开发者工具
   - Network标签 -> 找到失败的请求 -> 查看Response

4. **临时禁用RLS测试**
   ```sql
   ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
   ```
   如果禁用后能上传，说明确实是RLS策略问题。

## 安全性说明

当前配置的安全级别：
- ✅ 任何人可以投稿（符合需求）
- ✅ 只能看到已批准的投稿（保护未审核内容）
- ✅ 不能修改或删除别人的投稿
- ⚠️ 没有防止重复投稿的限制（需要在应用层实现）
- ⚠️ 没有速率限制（需要在应用层或使用Supabase的rate limiting功能）

## 后续优化建议

1. **添加更新策略**（如果需要作者编辑功能）
   ```sql
   CREATE POLICY "enable_update_own_submissions"
   ON public.submissions
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
   ```

2. **添加删除策略**（如果需要作者删除功能）
   ```sql
   CREATE POLICY "enable_delete_own_submissions"
   ON public.submissions
   FOR DELETE
   TO authenticated
   USING (auth.uid() = user_id);
   ```

3. **添加管理员策略**（如果需要管理后台）
   ```sql
   CREATE POLICY "enable_all_for_admins"
   ON public.submissions
   FOR ALL
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM public.admin_users 
       WHERE user_id = auth.uid()
     )
   );
   ```
