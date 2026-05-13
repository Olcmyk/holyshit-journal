# Add ALTCHA CAPTCHA to Submission and Voting Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ALTCHA CAPTCHA verification to both the submission form (`/submit`) and voting form (`/vote/[id]`) to prevent spam and abuse.

**Architecture:** Integrate ALTCHA widget as a checkbox-style component above submit buttons. Create server-side challenge generation endpoint and verify CAPTCHA payload in existing API routes before processing submissions/votes.

**Tech Stack:** 
- ALTCHA (altcha npm package)
- Next.js 15 App Router
- React 19
- TypeScript
- Supabase (existing)

---

## Task 1: Install ALTCHA Package

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install altcha package**

```bash
npm install altcha
```

Expected: Package installed successfully, package.json and package-lock.json updated

- [ ] **Step 2: Verify installation**

```bash
npm list altcha
```

Expected: Shows altcha version installed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add altcha package for CAPTCHA verification"
```

---

## Task 2: Create ALTCHA Challenge API Endpoint

**Files:**
- Create: `app/api/altcha/challenge/route.ts`

- [ ] **Step 1: Write the challenge generation endpoint**

```typescript
import { NextResponse } from 'next/server';
import { createChallenge, pbkdf2 } from 'altcha/lib';

// HMAC secrets - in production, move to environment variables
const HMAC_SIGNATURE_SECRET = process.env.ALTCHA_HMAC_SECRET || 'your-secret-key-change-in-production';
const HMAC_KEY_SIGNATURE_SECRET = process.env.ALTCHA_HMAC_KEY_SECRET || 'your-second-secret-key-change-in-production';

export async function GET() {
  try {
    const challenge = await createChallenge({
      algorithm: 'PBKDF2/SHA-256',
      cost: 5000, // Adjust difficulty as needed
      deriveKey: pbkdf2.deriveKey,
      hmacSignatureSecret: HMAC_SIGNATURE_SECRET,
      hmacKeySignatureSecret: HMAC_KEY_SIGNATURE_SECRET,
      expiresAt: new Date(Date.now() + 300_000), // 5 minutes expiration
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Failed to create ALTCHA challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Test the endpoint**

Start dev server and test:
```bash
curl http://localhost:3000/api/altcha/challenge
```

Expected: JSON response with `parameters` and `signature` fields

- [ ] **Step 3: Commit**

```bash
git add app/api/altcha/challenge/route.ts
git commit -m "feat: add ALTCHA challenge generation endpoint"
```

---

## Task 3: Create ALTCHA Verification Utility

**Files:**
- Create: `lib/altcha/verify.ts`

- [ ] **Step 1: Write verification utility function**

```typescript
import { verifySolution, pbkdf2 } from 'altcha/lib';

const HMAC_SIGNATURE_SECRET = process.env.ALTCHA_HMAC_SECRET || 'your-secret-key-change-in-production';
const HMAC_KEY_SIGNATURE_SECRET = process.env.ALTCHA_HMAC_KEY_SECRET || 'your-second-secret-key-change-in-production';

interface AltchaPayload {
  algorithm: string;
  challenge: string;
  number: number;
  salt: string;
  signature: string;
}

export async function verifyAltchaPayload(payload: string): Promise<boolean> {
  try {
    // Parse the base64 payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    ) as AltchaPayload;

    // Verify the solution
    const result = await verifySolution({
      challenge: decodedPayload.challenge,
      deriveKey: pbkdf2.deriveKey,
      hmacKeySignatureSecret: HMAC_KEY_SIGNATURE_SECRET,
      hmacSignatureSecret: HMAC_SIGNATURE_SECRET,
      solution: {
        counter: decodedPayload.number,
        derivedKey: decodedPayload.salt,
      },
    });

    return result === true;
  } catch (error) {
    console.error('ALTCHA verification error:', error);
    return false;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/altcha/verify.ts
git commit -m "feat: add ALTCHA payload verification utility"
```

---

## Task 4: Create ALTCHA React Component

**Files:**
- Create: `app/components/AltchaWidget.tsx`

- [ ] **Step 1: Write the ALTCHA widget component**

```typescript
'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import 'altcha';
import type {} from 'altcha/types/react';

interface AltchaWidgetElement extends HTMLElement {
  configure: (config: object) => Promise<void>;
  verify: () => Promise<{ payload: string } | null>;
  reset: () => void;
  getState: () => string;
}

interface AltchaWidgetProps {
  onVerified: (payload: string) => void;
  onStateChange?: (state: string) => void;
}

export default function AltchaWidget({ onVerified, onStateChange }: AltchaWidgetProps) {
  const widgetRef = useRef<AltchaWidgetElement>(null);

  // Handle SSR - only render widget on client
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    const handleVerified = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.payload) {
        onVerified(customEvent.detail.payload);
      }
    };

    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (onStateChange && customEvent.detail?.state) {
        onStateChange(customEvent.detail.state);
      }
    };

    widget.addEventListener('verified', handleVerified);
    widget.addEventListener('statechange', handleStateChange);

    return () => {
      widget.removeEventListener('verified', handleVerified);
      widget.removeEventListener('statechange', handleStateChange);
    };
  }, [isClient, onVerified, onStateChange]);

  if (!isClient) {
    return (
      <div className="border-2 border-gray-300 p-4 text-center text-gray-500">
        加载验证组件...
      </div>
    );
  }

  return (
    <altcha-widget
      ref={widgetRef}
      challengeurl="/api/altcha/challenge"
      hidefooter="true"
      hidelogo="true"
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/AltchaWidget.tsx
git commit -m "feat: add ALTCHA widget React component"
```

---

## Task 5: Integrate ALTCHA into Submit Page

**Files:**
- Modify: `app/submit/page.tsx:66-127` (handleSubmit function and form)

- [ ] **Step 1: Add ALTCHA state and import**

Add at the top of the file after existing imports:

```typescript
import AltchaWidget from '@/app/components/AltchaWidget';
```

Add state after line 19 (after `isExtracting` state):

```typescript
const [altchaPayload, setAltchaPayload] = useState<string>('');
const [altchaVerified, setAltchaVerified] = useState(false);
```

- [ ] **Step 2: Add ALTCHA handlers**

Add after line 64 (after `handlePdfChange` function):

```typescript
const handleAltchaVerified = (payload: string) => {
  setAltchaPayload(payload);
  setAltchaVerified(true);
  setError('');
};

const handleAltchaStateChange = (state: string) => {
  if (state !== 'verified') {
    setAltchaVerified(false);
  }
};
```

- [ ] **Step 3: Add ALTCHA validation in handleSubmit**

Modify the `handleSubmit` function at line 66. Add validation after line 78 (after author validation):

```typescript
// 验证 ALTCHA
if (!altchaVerified || !altchaPayload) {
  setError('请完成验证码验证');
  setIsSubmitting(false);
  setIsExtracting(false);
  return;
}
```

And add payload to FormData after line 106:

```typescript
submitData.append('altchaPayload', altchaPayload);
```

- [ ] **Step 4: Add ALTCHA widget to form UI**

Add the widget before the submit button section (before line 326). Insert after the PDF upload section (after line 324):

```typescript
{/* ALTCHA 验证 */}
<div>
  <label className="block font-bold mb-2">
    安全验证 <span className="text-red-600">*</span>
  </label>
  <AltchaWidget
    onVerified={handleAltchaVerified}
    onStateChange={handleAltchaStateChange}
  />
  {!altchaVerified && (
    <p className="text-sm text-gray-500 mt-2">
      请完成上方验证后才能提交
    </p>
  )}
</div>
```

- [ ] **Step 5: Update submit button disabled state**

Modify line 330 to include ALTCHA verification:

```typescript
disabled={isSubmitting || !altchaVerified}
```

- [ ] **Step 6: Test the integration**

Run dev server and navigate to http://localhost:3000/submit

Expected: ALTCHA widget appears above submit button, submit button disabled until verified

- [ ] **Step 7: Commit**

```bash
git add app/submit/page.tsx
git commit -m "feat: integrate ALTCHA verification into submission form"
```

---

## Task 6: Add ALTCHA Verification to Submit API Route

**Files:**
- Modify: `app/api/submit/route.ts:7-50`
- Modify: `lib/altcha/verify.ts` (if needed for imports)

- [ ] **Step 1: Import verification utility**

Add import at the top of `app/api/submit/route.ts` after line 5:

```typescript
import { verifyAltchaPayload } from '@/lib/altcha/verify';
```

- [ ] **Step 2: Add ALTCHA verification in POST handler**

Add verification after line 41 (after IP rate limit check, before parsing form data). Insert after the IP check block:

```typescript
// 解析 FormData 以获取 ALTCHA payload
const formData = await request.formData();
const altchaPayload = formData.get('altchaPayload') as string;

// 验证 ALTCHA
if (!altchaPayload) {
  return NextResponse.json(
    { error: '缺少验证码' },
    { status: 400 }
  );
}

const isAltchaValid = await verifyAltchaPayload(altchaPayload);
if (!isAltchaValid) {
  return NextResponse.json(
    { error: '验证码验证失败，请重试' },
    { status: 400 }
  );
}

// Continue with existing form data parsing...
```

Note: You'll need to adjust the existing code that parses formData since we're now parsing it earlier.

- [ ] **Step 3: Test the API verification**

Test by submitting the form without completing ALTCHA:

Expected: Error message "请完成验证码验证"

Test by completing ALTCHA and submitting:

Expected: Form submits successfully

- [ ] **Step 4: Commit**

```bash
git add app/api/submit/route.ts
git commit -m "feat: add ALTCHA verification to submit API endpoint"
```

---

## Task 7: Integrate ALTCHA into Vote Page

**Files:**
- Modify: `app/vote/[id]/page.tsx:77-128` (handleSubmit function and form)

- [ ] **Step 1: Add ALTCHA state and import**

Add at the top of the file after existing imports (after line 7):

```typescript
import AltchaWidget from '@/app/components/AltchaWidget';
```

Add state after line 34 (after `fingerprint` state):

```typescript
const [altchaPayload, setAltchaPayload] = useState<string>('');
const [altchaVerified, setAltchaVerified] = useState(false);
```

- [ ] **Step 2: Add ALTCHA handlers**

Add after line 75 (after `fetchData` function):

```typescript
const handleAltchaVerified = (payload: string) => {
  setAltchaPayload(payload);
  setAltchaVerified(true);
  setError('');
};

const handleAltchaStateChange = (state: string) => {
  if (state !== 'verified') {
    setAltchaVerified(false);
  }
};
```

- [ ] **Step 3: Add ALTCHA validation in handleSubmit**

Modify the `handleSubmit` function at line 77. Add validation after line 91 (after fingerprint check):

```typescript
// 检查 ALTCHA 是否已验证
if (!altchaVerified || !altchaPayload) {
  setError('请完成验证码验证');
  return;
}
```

And add payload to request body at line 106:

```typescript
body: JSON.stringify({
  submission_id: submissionId,
  fingerprint,
  answers,
  altchaPayload,
}),
```

- [ ] **Step 4: Add ALTCHA widget to form UI**

Add the widget before the submit button section (before line 223). Insert after the questions loop (after line 215):

```typescript
{/* ALTCHA 验证 */}
<div className="border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    安全验证
  </h3>
  <AltchaWidget
    onVerified={handleAltchaVerified}
    onStateChange={handleAltchaStateChange}
  />
  {!altchaVerified && (
    <p className="text-sm text-gray-500 mt-2">
      请完成验证后才能提交投票
    </p>
  )}
</div>
```

- [ ] **Step 5: Update submit button disabled state**

Modify line 226 to include ALTCHA verification:

```typescript
disabled={submitting || Object.keys(answers).length !== questions.length || !altchaVerified}
```

- [ ] **Step 6: Test the integration**

Run dev server and navigate to a vote page (need to be in voting period)

Expected: ALTCHA widget appears above submit button, submit button disabled until verified

- [ ] **Step 7: Commit**

```bash
git add app/vote/[id]/page.tsx
git commit -m "feat: integrate ALTCHA verification into voting form"
```

---

## Task 8: Add ALTCHA Verification to Vote API Route

**Files:**
- Modify: `app/api/vote/route.ts:5-50`

- [ ] **Step 1: Import verification utility**

Add import at the top of `app/api/vote/route.ts` after line 3:

```typescript
import { verifyAltchaPayload } from '@/lib/altcha/verify';
```

- [ ] **Step 2: Add ALTCHA verification in POST handler**

Modify the body destructuring at line 9 to include altchaPayload:

```typescript
const { submission_id, fingerprint, answers, altchaPayload } = body;
```

Add verification after line 38 (after answers validation, before IP check):

```typescript
// 验证 ALTCHA
if (!altchaPayload) {
  return NextResponse.json(
    { error: '缺少验证码' },
    { status: 400 }
  );
}

const isAltchaValid = await verifyAltchaPayload(altchaPayload);
if (!isAltchaValid) {
  return NextResponse.json(
    { error: '验证码验证失败，请重试' },
    { status: 400 }
  );
}
```

- [ ] **Step 3: Test the API verification**

Test by submitting vote without completing ALTCHA:

Expected: Error message "请完成验证码验证"

Test by completing ALTCHA and submitting:

Expected: Vote submits successfully

- [ ] **Step 4: Commit**

```bash
git add app/api/vote/route.ts
git commit -m "feat: add ALTCHA verification to vote API endpoint"
```

---

## Task 9: Add Environment Variables Documentation

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Add ALTCHA configuration section**

Add at the end of the file:

```bash
# ============================================
# ALTCHA 验证码配置
# ============================================

# ALTCHA HMAC 签名密钥（生产环境必须修改）
# 用于生成和验证 ALTCHA 挑战的签名
ALTCHA_HMAC_SECRET=your-secret-key-change-in-production

# ALTCHA HMAC 密钥签名密钥（生产环境必须修改）
# 用于快速验证派生密钥的签名
ALTCHA_HMAC_KEY_SECRET=your-second-secret-key-change-in-production
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "docs: add ALTCHA environment variables to example config"
```

---

## Task 10: End-to-End Testing

**Files:**
- Test: Submit form at `/submit`
- Test: Vote form at `/vote/[id]`

- [ ] **Step 1: Test submission form flow**

1. Navigate to http://localhost:3000/submit
2. Fill in all required fields
3. Verify ALTCHA widget loads
4. Try submitting without completing ALTCHA
5. Complete ALTCHA verification
6. Submit form

Expected: 
- Submit button disabled until ALTCHA verified
- Error shown if trying to submit without ALTCHA
- Form submits successfully after ALTCHA verification

- [ ] **Step 2: Test vote form flow**

1. Navigate to a voting page (ensure in voting period)
2. Answer all questions
3. Verify ALTCHA widget loads
4. Try submitting without completing ALTCHA
5. Complete ALTCHA verification
6. Submit vote

Expected:
- Submit button disabled until ALTCHA verified
- Error shown if trying to submit without ALTCHA
- Vote submits successfully after ALTCHA verification

- [ ] **Step 3: Test API validation**

Use curl or Postman to test API endpoints without ALTCHA payload:

```bash
# Test submit endpoint
curl -X POST http://localhost:3000/api/submit \
  -F "title=Test" \
  -F "abstract=Test" \
  -F "keywords=test"

# Test vote endpoint
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"submission_id":"test","fingerprint":"test","answers":{}}'
```

Expected: Both return 400 error with "缺少验证码" message

- [ ] **Step 4: Document test results**

Create a simple test report noting:
- ✓ ALTCHA widget renders correctly
- ✓ Form validation works
- ✓ API validation works
- ✓ User experience is smooth

---

## Task 11: Final Commit and Summary

**Files:**
- All modified files

- [ ] **Step 1: Run final checks**

```bash
# Check TypeScript compilation
npm run build

# Check for any console errors
npm run dev
```

Expected: No TypeScript errors, dev server starts successfully

- [ ] **Step 2: Create final commit if needed**

```bash
git status
# If there are any uncommitted changes, commit them
git add .
git commit -m "chore: final cleanup for ALTCHA integration"
```

- [ ] **Step 3: Verify all commits**

```bash
git log --oneline -15
```

Expected: See all commits from this implementation plan

---

## Implementation Notes

### Security Considerations
- ALTCHA HMAC secrets MUST be changed in production
- Store secrets in environment variables, never commit them
- Challenge expiration is set to 5 minutes
- Server-side verification is mandatory for both forms

### Performance
- ALTCHA widget loads only on client-side (SSR handled)
- Challenge generation is fast (~5ms)
- Verification adds minimal latency (~10-20ms)

### User Experience
- Widget appears as a checkbox-style component
- Clear visual feedback when verified
- Submit buttons disabled until verification complete
- Error messages guide users to complete verification

### Maintenance
- ALTCHA package should be kept up to date
- Monitor challenge difficulty (cost parameter) and adjust if needed
- Consider adding analytics to track CAPTCHA completion rates
