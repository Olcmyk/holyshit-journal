# 投票防护改进方案

## 问题
当前系统在无痕模式下可以绕过 fingerprint 检测，重复投票。

## 已实施的改进

### 1. 前端：使用增强版指纹 ✅
**文件**: `app/vote/[id]/page.tsx`

**改动**:
- 从使用 `FingerprintJS.load().get().visitorId` 改为使用 `generateEnhancedFingerprint()`
- 增强版指纹包含更多硬件特征（Canvas、WebGL、Audio、字体等），在无痕模式下更稳定

### 2. 后端：IP + Fingerprint 双重检测 ✅
**文件**: `app/api/vote/route.ts`

**改动**:
```typescript
// 检查是否已投票（fingerprint 或 IP）
const { data: existingVote } = await supabase
  .from('votes')
  .select('id')
  .eq('submission_id', submission_id)
  .or(`fingerprint.eq.${fingerprint},ip_address.eq.${ip}`)
  .single();
```

**效果**: 即使 fingerprint 改变，同一 IP 也无法重复投票

### 3. 后端：IP 速率限制 ✅
**文件**: `app/api/vote/route.ts`

**改动**:
- 检测同一 IP 在 1 小时内的投票次数
- 如果超过 3 次，自动封禁该 IP 24 小时
- 防止快速切换无痕模式刷票

```typescript
// 检查同一 IP 在短时间内的投票次数
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const { data: recentVotes } = await supabase
  .from('votes')
  .select('id')
  .eq('ip_address', ip)
  .gte('voted_at', oneHourAgo);

if (recentVotes && recentVotes.length >= 3) {
  // 自动封禁 24 小时
  await supabase.from('ip_blocks').upsert({
    ip_address: ip,
    reason: '短时间内多次投票',
    blocked_until: blockUntil.toISOString(),
    request_count: recentVotes.length + 1,
  });
}
```

### 4. 后端：冷却时间记录 IP ✅
**文件**: `app/api/vote/route.ts`

**改动**:
- 答错题目时，同时记录 `fingerprint` 和 `ip_address` 到 `vote_cooldowns` 表
- 确保冷却时间与 IP 关联，防止切换无痕模式绕过

## 防护层级

现在系统有 **4 层防护**：

1. **Fingerprint 检测** - 基于硬件特征的增强指纹
2. **IP 检测** - 同一 IP 无法为同一文章重复投票
3. **速率限制** - 1小时内同一 IP 最多投票 3 次
4. **答题冷却** - 答错后 10 分钟内无法再次尝试（绑定 IP）

## 攻击场景分析

### 场景 1: 切换无痕模式
- **防护**: IP 检测 + 速率限制
- **结果**: 第一次可能成功，但同一 IP 无法重复投票，且 1 小时内超过 3 次会被封禁

### 场景 2: 使用 VPN 切换 IP
- **防护**: 增强版 Fingerprint
- **结果**: 硬件指纹在不同 IP 下保持一致，无法重复投票

### 场景 3: VPN + 无痕模式
- **防护**: 速率限制 + 答题机制
- **结果**: 需要每次答对题目，且频繁切换会触发速率限制

### 场景 4: 多设备刷票
- **防护**: 答题机制 + 人工审核
- **结果**: 需要真实阅读论文才能答对题目，成本较高

## 待处理的 TypeScript 错误

当前代码存在 Supabase 类型推断问题，需要修复：
- `app/api/vote/route.ts` - 多个类型错误
- `app/api/submit/route.ts` - 类型错误
- `app/api/submissions/route.ts` - 类型错误
- `app/archive/page.tsx` - 类型错误

这些是 TypeScript 编译错误，不影响运行时逻辑，但需要修复才能构建。

## 建议的额外改进（未实施）

1. **设备指纹库升级** - 考虑使用商业级指纹服务（如 FingerprintJS Pro）
2. **行为分析** - 记录用户答题时间、鼠标移动等行为特征
3. **验证码** - 在检测到可疑行为时要求验证码
4. **IP 信誉系统** - 集成 IP 信誉数据库，识别代理/VPN
5. **机器学习** - 训练模型识别异常投票模式
