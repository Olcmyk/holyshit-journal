---
name: Enhanced Fingerprint and IP Rate Limiting
description: Implement hardware-based fingerprinting and IP rate limiting to prevent vote manipulation through incognito mode
type: feature
date: 2026-05-04
---

# Enhanced Fingerprint and IP Rate Limiting Design

## Problem Statement

The current voting system can be easily bypassed by users opening incognito/private browsing windows. Each incognito session generates a new fingerprint, allowing unlimited votes on the same article from the same device.

Current protections:
- Basic FingerprintJS (default config) - ineffective in incognito mode
- Quiz validation (3 questions)
- 10-minute cooldown on wrong answers
- IP blocking table (not actively used)

## Goals

1. **Prevent incognito mode abuse**: Detect the same device even in incognito mode
2. **IP-based rate limiting**: Limit votes per IP address (hourly and daily)
3. **Maintain user experience**: Don't block legitimate users
4. **Zero cost**: Use only free, open-source solutions

## Non-Goals

- 100% prevention (impossible without login)
- VPN/proxy detection (can be added later)
- Real-time behavioral analysis
- Paid fingerprinting services

## Solution Overview

Two-layer defense:

1. **Enhanced Hardware Fingerprinting**: Extract stable hardware characteristics from FingerprintJS components
2. **IP Rate Limiting**: Limit votes per IP address (5/hour, 15/day)

## Architecture

### Component Structure

```
lib/
  utils/
    fingerprint.ts          # NEW: Enhanced fingerprint generator
    ip-rate-limit.ts        # NEW: IP rate limit checker

app/
  vote/[id]/
    page.tsx                # MODIFIED: Use enhanced fingerprint
  api/
    vote/
      route.ts              # MODIFIED: Add IP rate limit checks
```

### Data Flow

```
User visits voting page
  ↓
Generate enhanced fingerprint (hardware-based)
  ↓
User submits vote
  ↓
Backend validation chain:
  1. Check IP is not blocked (existing)
  2. Check IP hourly limit (5 votes) [NEW]
  3. Check IP daily limit (15 votes) [NEW]
  4. Check fingerprint hasn't voted (existing)
  5. Check answer cooldown (existing)
  6. Validate quiz answers (existing)
  ↓
Record vote with enhanced fingerprint + IP
```

## Detailed Design

### 1. Enhanced Fingerprint Generation

**File**: `lib/utils/fingerprint.ts`

**Purpose**: Generate a stable device fingerprint based on hardware characteristics that persist across incognito sessions.

**Implementation**:

```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import CryptoJS from 'crypto-js';

export async function generateEnhancedFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  
  // Extract stable hardware components
  const components = result.components;
  
  const stableFeatures = {
    canvas: components.canvas?.value || '',
    webgl: JSON.stringify({
      vendor: components.webglVendor?.value || '',
      renderer: components.webglRenderer?.value || ''
    }),
    audio: components.audio?.value || 0,
    fonts: JSON.stringify(components.fonts?.value || []),
    screenResolution: JSON.stringify(components.screenResolution?.value || []),
    hardwareConcurrency: components.hardwareConcurrency?.value || 0,
    timezone: components.timezone?.value || '',
    platform: components.platform?.value || ''
  };
  
  // Create deterministic hash
  const featuresString = JSON.stringify(stableFeatures);
  const hash = CryptoJS.SHA256(featuresString).toString();
  
  return hash;
}
```

**Hardware Features Collected**:

| Feature | Description | Stability in Incognito |
|---------|-------------|------------------------|
| Canvas | GPU rendering characteristics | ✅ High |
| WebGL | Graphics card vendor/renderer | ✅ High |
| Audio | Audio processing fingerprint | ✅ High |
| Fonts | Installed system fonts | ✅ High |
| Screen Resolution | Display dimensions | ✅ High |
| Hardware Concurrency | CPU core count | ✅ High |
| Timezone | System timezone | ✅ High |
| Platform | Operating system | ✅ High |

**Expected Effectiveness**:
- Normal mode: 95%+ same fingerprint
- Incognito mode: 60-70% same fingerprint (much better than current ~0%)
- Different devices: <1% collision rate

### 2. IP Rate Limiting

**File**: `lib/utils/ip-rate-limit.ts`

**Purpose**: Check if an IP address has exceeded voting limits.

**Implementation**:

```typescript
import { createServiceClient } from '@/lib/supabase/server';

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // minutes
}

export async function checkIpRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const supabase = await createServiceClient();
  
  // Check hourly limit (5 votes per hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const { count: hourlyCount } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('voted_at', oneHourAgo.toISOString());
  
  if (hourlyCount !== null && hourlyCount >= 5) {
    // Calculate retry time
    const { data: oldestVote } = await supabase
      .from('votes')
      .select('voted_at')
      .eq('ip_address', ipAddress)
      .gte('voted_at', oneHourAgo.toISOString())
      .order('voted_at', { ascending: true })
      .limit(1)
      .single();
    
    const retryAfter = oldestVote 
      ? Math.ceil((new Date(oldestVote.voted_at).getTime() + 60 * 60 * 1000 - Date.now()) / 60000)
      : 60;
    
    return {
      allowed: false,
      reason: `投票过于频繁，请 ${retryAfter} 分钟后再试`,
      retryAfter
    };
  }
  
  // Check daily limit (15 votes per day)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { count: dailyCount } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('voted_at', oneDayAgo.toISOString());
  
  if (dailyCount !== null && dailyCount >= 15) {
    return {
      allowed: false,
      reason: '今日投票次数已达上限，请明天再来'
    };
  }
  
  return { allowed: true };
}
```

**Rate Limits**:
- **Hourly**: 5 votes per hour
- **Daily**: 15 votes per 24 hours

**Rationale**:
- Hourly limit prevents rapid-fire voting
- Daily limit prevents sustained abuse
- Limits are generous enough for legitimate users
- Shared IPs (offices, schools) can still function

### 3. Frontend Changes

**File**: `app/vote/[id]/page.tsx`

**Changes**:
1. Replace `FingerprintJS.load()` call with `generateEnhancedFingerprint()`
2. Update state management to use enhanced fingerprint

**Modified Code**:

```typescript
import { generateEnhancedFingerprint } from '@/lib/utils/fingerprint';

// Replace initFingerprint function
const initFingerprint = async () => {
  const enhancedFp = await generateEnhancedFingerprint();
  setFingerprint(enhancedFp);
};
```

### 4. Backend Changes

**File**: `app/api/vote/route.ts`

**Changes**:
1. Add IP rate limit check before existing validations
2. Update error responses

**Modified Validation Chain**:

```typescript
import { checkIpRateLimit } from '@/lib/utils/ip-rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient();
    const body = await request.json();
    const { submission_id, fingerprint, answers } = body;

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // [EXISTING] Check voting period
    if (!isVotingPeriod()) { ... }

    // [EXISTING] Validate required fields
    if (!submission_id || !fingerprint || !answers) { ... }

    // [EXISTING] Check IP blocks
    const { data: ipBlock } = await supabase
      .from('ip_blocks')
      .select('blocked_until')
      .eq('ip_address', ip)
      .gte('blocked_until', new Date().toISOString())
      .single();

    if (ipBlock) { ... }

    // [NEW] Check IP rate limits
    const rateLimitResult = await checkIpRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason },
        { status: 429 }
      );
    }

    // [EXISTING] Check cooldown
    // [EXISTING] Check existing vote
    // [EXISTING] Validate answers
    // [EXISTING] Record vote
    
    ...
  }
}
```

## Database Schema

**No changes required**. We use existing tables:

- `votes` table: Already has `ip_address` and `fingerprint` columns
- `votes.idx_votes_ip` index: Already exists for IP queries
- `votes.idx_votes_fingerprint` index: Already exists for fingerprint queries

The enhanced fingerprint is stored in the existing `fingerprint` column (TEXT type, sufficient for SHA-256 hash).

## Error Messages

| Scenario | HTTP Status | Error Message |
|----------|-------------|---------------|
| IP hourly limit exceeded | 429 | `投票过于频繁，请 X 分钟后再试` |
| IP daily limit exceeded | 429 | `今日投票次数已达上限，请明天再来` |
| Fingerprint already voted | 400 | `您已经为这篇论文投过票了` (existing) |
| Answer cooldown active | 429 | `请等待 X 分钟后再试` (existing) |

## Testing Strategy

### Unit Tests

1. **Fingerprint Generation**:
   - Same device → same fingerprint
   - Different devices → different fingerprints
   - Incognito mode → same fingerprint (manual test)

2. **IP Rate Limiting**:
   - 5 votes in 1 hour → 6th vote rejected
   - 15 votes in 24 hours → 16th vote rejected
   - After cooldown expires → voting allowed again

### Integration Tests

1. Vote 5 times from same IP → 6th attempt fails with hourly limit
2. Vote 15 times from same IP over time → 16th attempt fails with daily limit
3. Open incognito mode → fingerprint should match (manual verification)
4. Different devices → different fingerprints

### Manual Testing

1. Vote normally → success
2. Vote again → "already voted" error
3. Open incognito → vote → should be blocked by fingerprint or IP limit
4. Use VPN → vote → should work (different IP)
5. Vote 5 times quickly → 6th blocked with hourly limit

## Performance Considerations

### Fingerprint Generation
- **Client-side**: ~100-200ms (acceptable for one-time operation)
- **No server impact**: All computation happens in browser

### IP Rate Limiting
- **Database queries**: 2 additional COUNT queries per vote attempt
- **Query performance**: Uses existing `idx_votes_ip` index
- **Expected latency**: <50ms per query
- **Optimization**: Queries run in parallel with existing checks

### Scalability
- Current scale: Estimated <1000 votes/day
- Database impact: Negligible with proper indexes
- Future optimization: Add Redis cache if needed (not required now)

## Security Considerations

### Fingerprint Stability vs Privacy
- **Trade-off**: More stable fingerprint = better tracking = privacy concern
- **Mitigation**: Only use for vote deduplication, not user tracking
- **Data retention**: Fingerprints stored only in `votes` table, not separately tracked

### IP Address Privacy
- **Storage**: IP addresses stored as INET type in PostgreSQL
- **Retention**: No automatic cleanup (consider adding later)
- **Compliance**: Ensure GDPR/privacy policy covers IP storage

### Bypass Techniques (Known Limitations)
- **VPN/Proxy**: Can bypass IP limits (acceptable trade-off)
- **Virtual machines**: Can bypass fingerprint (low probability)
- **Browser extensions**: May interfere with fingerprinting (acceptable)

## Rollout Plan

### Phase 1: Implementation
1. Create `lib/utils/fingerprint.ts`
2. Create `lib/utils/ip-rate-limit.ts`
3. Update `app/vote/[id]/page.tsx`
4. Update `app/api/vote/route.ts`

### Phase 2: Testing
1. Unit tests for fingerprint generation
2. Unit tests for IP rate limiting
3. Manual testing in normal and incognito modes

### Phase 3: Deployment
1. Deploy to production
2. Monitor error rates and vote patterns
3. Adjust limits if needed

### Phase 4: Monitoring
- Track vote rejection reasons (hourly vs daily limits)
- Monitor false positive rate (legitimate users blocked)
- Analyze fingerprint collision rate

## Future Enhancements

### Short-term (if needed)
1. **Adjustable limits**: Make rate limits configurable per environment
2. **Admin dashboard**: View IP voting patterns and blocked IPs
3. **Whitelist**: Allow certain IPs to bypass limits (for testing)

### Long-term (if abuse continues)
1. **VPN/Proxy detection**: Use free APIs (ipapi.co, ip-api.com)
2. **Behavioral analysis**: Detect suspicious voting patterns
3. **CAPTCHA**: Add for suspicious IPs
4. **Email verification**: Optional one-time verification for voters

## Success Metrics

### Primary Metrics
- **Incognito detection rate**: Target 60-70% (up from ~0%)
- **Vote manipulation reduction**: Target 80-90% reduction in duplicate votes
- **False positive rate**: Target <5% (legitimate users blocked)

### Secondary Metrics
- **User complaints**: Monitor for legitimate users being blocked
- **Vote distribution**: More even distribution across submissions
- **System performance**: API latency remains <500ms

## Alternatives Considered

### Alternative 1: FingerprintJS Pro
- **Pros**: 95%+ incognito detection
- **Cons**: $200+/month cost
- **Decision**: Not cost-effective for current scale

### Alternative 2: Require Login
- **Pros**: 99%+ effective, simple implementation
- **Cons**: Breaks "decentralized" philosophy, reduces participation
- **Decision**: Keep as fallback option

### Alternative 3: Web3 Wallet Signatures
- **Pros**: Truly decentralized, one wallet = one vote
- **Cons**: Requires crypto wallet, high barrier to entry
- **Decision**: Consider for future if community adopts Web3

### Alternative 4: New Rate Limit Table
- **Pros**: Slightly better performance, more metadata
- **Cons**: Additional complexity, maintenance overhead
- **Decision**: Use existing `votes` table (simpler)

## Open Questions

None - design is complete and approved.

## Appendix

### References
- [FingerprintJS Documentation](https://github.com/fingerprintjs/fingerprintjs)
- [Browser Fingerprinting Research](https://arxiv.org/abs/1905.01051)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

### Dependencies
- `@fingerprintjs/fingerprintjs`: ^4.2.0 (already installed)
- `crypto-js`: ^4.2.0 (already installed)
- No new dependencies required
