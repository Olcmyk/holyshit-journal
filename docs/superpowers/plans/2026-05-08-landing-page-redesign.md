# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Holy S.H.I.T landing page to prioritize main action CTAs (Submit/Latrine/Archive) over informational content, making navigation the visual focus.

**Architecture:** Replace the current hero-centered status indicator and non-clickable process cards with a compact top status bar and three large, clickable action cards. Move "About" section below the main actions. Maintain existing color scheme (black borders, gold accents, white backgrounds).

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS

---

## File Structure

**Modified:**
- `app/page.tsx` - Complete redesign of landing page component

**No new files needed** - This is a single-component redesign

---

### Task 1: Create Top Status Bar Component

**Files:**
- Modify: `app/page.tsx:1-138`

- [ ] **Step 1: Replace hero section status indicator with compact top bar**

Remove the large status box from lines 23-35 and replace with a compact top banner:

```tsx
{/* Top Status Bar */}
<div className="border-b-2 border-black py-2 px-8 bg-gold/10">
  <div className="max-w-6xl mx-auto text-center">
    <p className="font-sans text-sm uppercase tracking-wider">
      当前状态：
      {isSubmission && <span className="font-semibold">投稿期（1-24日）</span>}
      {isVoting && <span className="font-semibold">投票期（25日-月末）</span>}
      {!isSubmission && !isVoting && <span className="font-semibold">评选中</span>}
    </p>
  </div>
</div>
```

- [ ] **Step 2: Verify the component renders**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: Top status bar appears as a thin banner at the top

- [ ] **Step 3: Commit status bar change**

```bash
git add app/page.tsx
git commit -m "feat: add compact top status bar to landing page"
```

---

### Task 2: Simplify Hero Section

**Files:**
- Modify: `app/page.tsx:11-37`

- [ ] **Step 1: Remove border and simplify hero section**

Replace the hero section (lines 11-37) with simplified version:

```tsx
{/* Hero Section */}
<section className="py-16 px-8">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="font-serif text-7xl md:text-8xl font-bold mb-6">
      Holy S.H.I.T
    </h1>
    <p className="font-serif text-2xl md:text-3xl mb-4 tracking-wider">
      Sciences · Humanities · Information · Technology
    </p>
    <p className="font-serif text-xl md:text-2xl italic text-gray-600">
      Truth Fades, S.H.I.T Lasts.
    </p>
  </div>
</section>
```

- [ ] **Step 2: Verify hero section renders correctly**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: Clean hero section without border box, no status indicator

- [ ] **Step 3: Commit hero simplification**

```bash
git add app/page.tsx
git commit -m "refactor: simplify hero section, remove status box"
```

---

### Task 3: Create Main Action Cards Section

**Files:**
- Modify: `app/page.tsx:58-94`

- [ ] **Step 1: Replace process section with main action cards**

Replace the entire "Process" section (lines 58-94) with clickable action cards:

```tsx
{/* Main Action Cards */}
<section className="border-y-2 border-black py-16 px-8 bg-white">
  <div className="max-w-6xl mx-auto">
    <div className="grid md:grid-cols-3 gap-6">
      {/* Submit Card */}
      {isSubmission ? (
        <Link
          href="/submit"
          className="group border-2 border-black p-10 bg-white hover:bg-gold/5 hover:border-gold transition-all"
        >
          <h3 className="font-serif text-3xl font-bold mb-4">
            排泄你的学术成果
          </h3>
          <p className="font-sans text-gray-700 mb-6 leading-relaxed">
            提交PDF，AI审稿
          </p>
          <div className="font-sans text-lg font-semibold text-gold group-hover:text-gold-dark">
            立即投稿 →
          </div>
        </Link>
      ) : (
        <div className="border-2 border-gray-300 p-10 bg-gray-50 opacity-60">
          <h3 className="font-serif text-3xl font-bold mb-4 text-gray-600">
            排泄你的学术成果
          </h3>
          <p className="font-sans text-gray-500 mb-6 leading-relaxed">
            提交PDF，AI审稿
          </p>
          <div className="font-sans text-lg font-semibold text-gray-400">
            投稿期未开放
          </div>
        </div>
      )}

      {/* Latrine Card */}
      <Link
        href="/latrine"
        className="group border-2 border-black p-10 bg-white hover:bg-gold/5 hover:border-gold transition-all"
      >
        <h3 className="font-serif text-3xl font-bold mb-4">
          进入旱厕
        </h3>
        <p className="font-sans text-gray-700 mb-6 leading-relaxed">
          阅读投稿，参与投票
        </p>
        <div className="font-sans text-lg font-semibold text-gold group-hover:text-gold-dark">
          {isVoting ? '前往投票' : '查看稿件'} →
        </div>
      </Link>

      {/* Archive Card */}
      <Link
        href="/archive"
        className="group border-2 border-black p-10 bg-white hover:bg-gold/5 hover:border-gold transition-all"
      >
        <h3 className="font-serif text-3xl font-bold mb-4">
          浏览往期构石
        </h3>
        <p className="font-sans text-gray-700 mb-6 leading-relaxed">
          查看历史获奖作品
        </p>
        <div className="font-sans text-lg font-semibold text-gold group-hover:text-gold-dark">
          进入档案馆 →
        </div>
      </Link>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify action cards render and are clickable**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: Three large cards displayed horizontally, entire cards are clickable, hover effects work

- [ ] **Step 3: Test dynamic behavior**

Test cases:
1. During submission period (1-24): Submit card should be active with "立即投稿"
2. Outside submission period: Submit card should be grayed out with "投稿期未开放"
3. During voting period (25-end): Latrine card shows "前往投票"
4. Outside voting period: Latrine card shows "查看稿件"

- [ ] **Step 4: Commit action cards**

```bash
git add app/page.tsx
git commit -m "feat: add main action cards with dynamic behavior"
```

---

### Task 4: Relocate and Simplify About Section

**Files:**
- Modify: `app/page.tsx:40-56`

- [ ] **Step 1: Move About section below action cards**

Move the "Introduction" section (currently lines 40-56) to after the action cards section and simplify:

```tsx
{/* About Section */}
<section className="py-16 px-8 bg-gray-50">
  <div className="max-w-4xl mx-auto">
    <h2 className="font-serif text-3xl font-bold mb-6 text-center">关于本刊</h2>
    <div className="prose prose-lg max-w-none font-sans">
      <p className="text-lg leading-relaxed mb-4">
        <span className="font-serif text-2xl font-bold">Holy S.H.I.T</span>
        是一本致力于发表最具讽刺性、科学性和娱乐性学术成果的月刊。
        我们相信，在这个充满荒诞的世界里，只有 S.H.I.T 能够永恒。
      </p>
      <p className="text-lg leading-relaxed">
        每月1-24日为投稿期，25日至月末为投票期。
        月末零点，我们将从所有投稿中选出得分最高的前10篇，
        永久收录于本刊的神圣殿堂。
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify About section appears below action cards**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: About section appears after the three action cards

- [ ] **Step 3: Commit About section relocation**

```bash
git add app/page.tsx
git commit -m "refactor: move About section below action cards"
```

---

### Task 5: Remove Old CTA Section

**Files:**
- Modify: `app/page.tsx:96-123`

- [ ] **Step 1: Delete the old CTA section**

Remove the entire "CTA Section" (lines 96-123) since the action cards now serve this purpose.

- [ ] **Step 2: Verify page layout is correct**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: Page flows from status bar → hero → action cards → about → footer

- [ ] **Step 3: Commit CTA section removal**

```bash
git add app/page.tsx
git commit -m "refactor: remove redundant CTA section"
```

---

### Task 6: Final Layout Verification and Responsive Testing

**Files:**
- Modify: `app/page.tsx` (if adjustments needed)

- [ ] **Step 1: Test desktop layout**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: Three action cards displayed in a row, proper spacing

- [ ] **Step 2: Test tablet layout**

Resize browser to tablet width (~768px)
Expected: Three cards still in a row but smaller, or 2+1 layout

- [ ] **Step 3: Test mobile layout**

Resize browser to mobile width (~375px)
Expected: Cards stack vertically, full width

- [ ] **Step 4: Test all hover states**

Hover over each action card
Expected: Background changes to gold/5, border changes to gold color

- [ ] **Step 5: Test all navigation links**

Click each card:
1. Submit card → `/submit` (if active)
2. Latrine card → `/latrine`
3. Archive card → `/archive`

Expected: All links navigate correctly

- [ ] **Step 6: Verify accessibility**

Check:
1. All cards have proper focus states when tabbing
2. Color contrast meets WCAG standards
3. Text is readable at all sizes

- [ ] **Step 7: Final commit if adjustments made**

```bash
git add app/page.tsx
git commit -m "fix: responsive layout and accessibility adjustments"
```

---

### Task 7: Cross-Browser Testing

**Files:**
- No file changes

- [ ] **Step 1: Test in Chrome**

Navigate to: `http://localhost:3000`
Expected: All features work correctly

- [ ] **Step 2: Test in Firefox**

Navigate to: `http://localhost:3000`
Expected: All features work correctly

- [ ] **Step 3: Test in Safari**

Navigate to: `http://localhost:3000`
Expected: All features work correctly

- [ ] **Step 4: Document any browser-specific issues**

If issues found, create follow-up tasks

---

## Completion Checklist

- [ ] Status bar is compact and at the top
- [ ] Hero section is simplified without status box
- [ ] Three action cards are prominent and clickable
- [ ] Submit card shows correct state based on period
- [ ] Latrine card shows correct text based on period
- [ ] Archive card is always active
- [ ] About section is below action cards
- [ ] Old CTA section is removed
- [ ] Responsive design works on all screen sizes
- [ ] Hover effects work correctly
- [ ] All navigation links work
- [ ] Color scheme matches existing site (black, white, gold)
- [ ] Typography uses existing fonts (Playfair Display, Inter)
- [ ] All commits follow conventional commit format

---

## Success Criteria

1. ✅ Main action cards are the largest, most prominent elements after the title
2. ✅ Status indicator is visible but not dominating visual center
3. ✅ About section is in secondary position
4. ✅ Page feels cleaner and more focused
5. ✅ Users can immediately identify where to go for their intended action
6. ✅ Design maintains consistency with existing site aesthetic
