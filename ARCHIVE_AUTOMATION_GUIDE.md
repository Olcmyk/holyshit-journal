# 自动归档配置指南

本项目提供三种归档方案，确保月末归档任务的可靠执行。

---

## 方案对比

| 方案 | 优先级 | 可靠性 | 配置难度 | 说明 |
|------|--------|--------|----------|------|
| **Vercel Cron** | 🥇 推荐 | ⭐⭐⭐⭐⭐ | 简单 | 与部署平台集成，最可靠 |
| **GitHub Actions** | 🥈 备份 | ⭐⭐⭐⭐ | 中等 | 需要配置 Secrets，免费额度充足 |
| **手动执行** | 🥉 应急 | ⭐⭐⭐ | 最简单 | 人工介入，适合应急情况 |

---

## 方案一：Vercel Cron（推荐）

### 1. 创建 API 路由

创建文件 `app/api/cron/archive/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { endOfMonth, format, getDate } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 最长执行60秒

export async function GET(request: NextRequest) {
  // 验证 Cron Secret（防止未授权访问）
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const lastDayOfMonth = endOfMonth(today);
    const isLastDay = getDate(today) === getDate(lastDayOfMonth);

    if (!isLastDay) {
      return NextResponse.json({
        message: 'Not the last day of month, skipping archive',
        date: format(today, 'yyyy-MM-dd'),
      });
    }

    // 执行归档逻辑
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const monthYear = format(today, 'yyyy-MM');

    // 检查是否已归档
    const { data: existing } = await supabase
      .from('selected_papers')
      .select('id')
      .eq('month_year', monthYear)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        message: 'Already archived',
        monthYear,
      });
    }

    // 获取所有投稿并计算得分
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .gte('created_at', `${monthYear}-01`)
      .lt('created_at', format(endOfMonth(today), 'yyyy-MM-dd'));

    if (fetchError) throw fetchError;

    // 计算最终得分
    const scored = submissions.map((s: any) => ({
      ...s,
      final_score:
        (s.scientific_score / 100) *
        (s.humor_score / 100) *
        (s.morality_score / 100) *
        (s.vote_count + 1),
    }));

    // 排序并选出前10名
    const top10 = scored
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 10);

    // 插入归档记录
    const archiveRecords = top10.map((submission, index) => ({
      month_year: monthYear,
      submission_id: submission.id,
      rank: index + 1,
      final_score: submission.final_score,
    }));

    const { error: insertError } = await supabase
      .from('selected_papers')
      .insert(archiveRecords);

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      monthYear,
      archived: top10.length,
      topScore: top10[0]?.final_score,
    });
  } catch (error: any) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 2. 配置 vercel.json

在项目根目录创建或修改 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/cron/archive",
      "schedule": "50 23 28-31 * *"
    }
  ]
}
```

### 3. 配置环境变量

在 Vercel 项目设置中添加：

```bash
CRON_SECRET=your-random-secret-string-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

生成随机 secret：
```bash
openssl rand -base64 32
```

### 4. 部署

```bash
git add .
git commit -m "feat: add Vercel Cron for monthly archive"
git push
```

Vercel 会自动识别 `vercel.json` 中的 cron 配置。

---

## 方案二：GitHub Actions（备份）

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加 Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 secrets：

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Workflow 文件

已创建：`.github/workflows/monthly-archive.yml`

### 3. 工作原理

- **自动执行**：每月28-31号的23:50 UTC运行
- **智能检查**：脚本内部会检查是否是最后一天
- **手动触发**：可以在 GitHub Actions 页面手动运行
  - 支持 `--force` 参数强制归档

### 4. 手动触发步骤

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Monthly Archive" workflow
4. 点击 "Run workflow"
5. 选择是否使用 `--force` 参数
6. 点击 "Run workflow" 确认

### 5. 查看执行日志

1. 进入 "Actions" 标签
2. 点击具体的 workflow run
3. 查看详细日志和错误信息

---

## 方案三：手动执行（应急）

### 使用场景

- Vercel Cron 失败
- GitHub Actions 失败
- 需要立即归档
- 测试归档功能

### 执行方式

#### 本地执行

```bash
# 1. 确保环境变量已配置（.env.local）
# 2. 强制归档（不检查日期）
node scripts/archive_monthly_winners.mjs --force

# 3. 模拟特定日期
node scripts/archive_monthly_winners.mjs --date=2026-05-31

# 4. 正常执行（只在月末执行）
node scripts/archive_monthly_winners.mjs
```

#### 通过 Vercel CLI 执行

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在生产环境执行
vercel env pull .env.production.local
node scripts/archive_monthly_winners.mjs --force
```

---

## 监控和通知

### 1. Vercel Cron 监控

- 在 Vercel Dashboard → Cron Jobs 查看执行历史
- 配置失败通知（Vercel 会发送邮件）

### 2. GitHub Actions 监控

- 在 Actions 页面查看执行状态
- 配置失败通知：Settings → Notifications → Actions

### 3. 数据库验证

定期检查归档数据：

```bash
node check_archive.mjs
```

或在 Supabase Dashboard 查询：

```sql
SELECT month_year, COUNT(*) as count
FROM selected_papers
GROUP BY month_year
ORDER BY month_year DESC;
```

---

## 故障排查

### Vercel Cron 未执行

1. 检查 `vercel.json` 配置是否正确
2. 确认环境变量 `CRON_SECRET` 已设置
3. 查看 Vercel Dashboard → Logs
4. 手动触发 API：
   ```bash
   curl -X GET https://your-domain.vercel.app/api/cron/archive \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### GitHub Actions 失败

1. 检查 Secrets 是否正确配置
2. 查看 Actions 日志
3. 手动触发 workflow 测试
4. 确认脚本文件路径正确

### 归档数据异常

1. 检查评分计算是否正确：
   ```bash
   node scripts/calculate_final_scores.mjs
   ```

2. 检查数据库中的投稿数据：
   ```bash
   node check_archive.mjs
   ```

3. 手动重新归档：
   ```bash
   # 先删除错误的归档记录（在 Supabase Dashboard）
   # 然后强制重新归档
   node scripts/archive_monthly_winners.mjs --force
   ```

---

## 最佳实践

### 1. 双重保障

- **主方案**：Vercel Cron（与部署平台集成）
- **备份方案**：GitHub Actions（独立运行）
- **应急方案**：手动执行脚本

### 2. 定期检查

每月1号检查上月归档是否成功：

```bash
# 查看最新归档
node check_archive.mjs
```

### 3. 测试流程

在每月中旬测试归档功能：

```bash
# 使用 --force 参数测试（不会影响真实数据，因为月份不同）
node scripts/archive_monthly_winners.mjs --force
```

### 4. 日志记录

- Vercel Cron 会自动记录日志
- GitHub Actions 保留执行历史
- 脚本输出详细的执行信息

---

## 时区说明

- **Vercel Cron**: 使用 UTC 时间
- **GitHub Actions**: 使用 UTC 时间
- **脚本内部**: 使用服务器本地时间

建议在 23:50-23:59 UTC 执行，对应：
- 北京时间：次日 07:50-07:59
- 美东时间：18:50-18:59 (EST) 或 19:50-19:59 (EDT)

---

## 成本说明

- **Vercel Cron**: 
  - Hobby 计划：免费（每月1次足够）
  - Pro 计划：包含在订阅中

- **GitHub Actions**: 
  - Public 仓库：完全免费
  - Private 仓库：每月2000分钟免费额度（每次执行<1分钟）

- **手动执行**: 完全免费

---

## 总结

推荐配置顺序：

1. ✅ **立即配置**：手动执行脚本（已完成）
2. 🚀 **部署后配置**：Vercel Cron（最可靠）
3. 🛡️ **额外保障**：GitHub Actions（备份方案）

这样可以确保即使某个方案失败，还有其他方案兜底。
