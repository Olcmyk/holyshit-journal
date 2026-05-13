# Landing Page Redesign Specification

## Overview

Redesign the Holy S.H.I.T landing page to prioritize main action CTAs and reduce visual clutter. The current design buries the most important navigation links at the bottom while giving excessive prominence to the status indicator and non-clickable process cards.

## Problems Addressed

1. **Status indicator占据视觉中心** - The voting/submission period notice takes up too much visual real estate in the hero section
2. **流程卡片不可点击** - The three process cards (💩排泄, 🚽旱厕, 🗿构石) occupy significant space but aren't interactive
3. **主要CTA太小** - The actual navigation links ("前往旱厕投票", "浏览往期构石") are tiny buttons at the bottom
4. **关于本刊位置不当** - The "About" section is prominently placed in the middle when it should be secondary

## Design Approach

**Selected: Approach A - Hero-Driven with Prominent CTAs**

Transform the landing page into a clear navigation hub by making the three main actions (Submit/Latrine/Archive) large, clickable cards in the hero section. Demote the status indicator and process explanation to supporting roles.

## Layout Structure

### 1. Top Status Bar
- **Position**: Fixed or sticky top banner
- **Content**: Current period status (投稿期/投票期/评选中)
- **Style**: Compact horizontal bar with black border, gold/10 background
- **Size**: Small, non-intrusive (e.g., py-2 instead of py-4)

### 2. Hero Section
- **Title**: "Holy S.H.I.T" - keep existing serif styling
- **Subtitle**: "Sciences · Humanities · Information · Technology"
- **Tagline**: "Truth Fades, S.H.I.T Lasts."
- **Style**: Centered, clean, no border box around status

### 3. Main Action Cards (Primary Focus)

Three large, clickable cards arranged horizontally (stack vertically on mobile):

#### Card 1: 投稿 (Submit)
- **Title**: "排泄你的学术成果"
- **Description**: "提交PDF，AI审稿" (brief, 1 line)
- **Dynamic behavior**:
  - During submission period: Show prominent "立即投稿" button, card is fully interactive
  - Outside submission period: Show "投稿期未开放 (X月X日开放)" in muted style
- **Link**: `/submit` (only active during submission period)

#### Card 2: 旱厕 (Latrine)
- **Title**: "进入旱厕"
- **Description**: "阅读投稿，参与投票" (brief, 1 line)
- **Dynamic behavior**:
  - During voting period: "前往投票"
  - Other times: "查看稿件"
- **Link**: `/latrine` (always active)

#### Card 3: 构石 (Archive)
- **Title**: "浏览往期构石"
- **Description**: "查看历史获奖作品" (brief, 1 line)
- **Button**: "进入档案馆"
- **Link**: `/archive` (always active)

**Card Design Specifications**:
- **No emoji icons** - Use typography and layout for visual hierarchy
- **Border**: 2px black border (consistent with site style)
- **Background**: White default, gold/5 on hover
- **Hover effect**: Gold border or gold background highlight
- **Entire card is clickable** - Not just the button text
- **Spacing**: Generous padding (p-8 or p-10)
- **Typography**: 
  - Title: font-serif text-3xl or text-4xl font-bold
  - Description: font-sans text-gray-700
  - Button/CTA: Integrated into card design, not a separate button element

### 4. About Section
- **Position**: Below main action cards
- **Title**: "关于本刊"
- **Content**: Keep existing text but make it more concise
- **Style**: Simple, clean, no heavy borders
- **Background**: Optional light gray (bg-gray-50) to differentiate from hero

### 5. Process Explanation (Optional/Simplified)
- **Position**: Below "About" section
- **Content**: Brief explanation of the three-step process (排泄 → 旱厕 → 构石)
- **Style**: Can be simplified or removed entirely since the main cards now serve as navigation
- **Alternative**: Convert to a simple timeline or flowchart instead of three separate boxes

### 6. Footer
- **Position**: Bottom
- **Content**: Copyright, disclaimer
- **Style**: Keep existing minimal design

## Visual Hierarchy

1. **Primary**: Main action cards (largest, most prominent)
2. **Secondary**: Hero title and tagline
3. **Tertiary**: Status bar (small but visible)
4. **Quaternary**: About section
5. **Quinary**: Process explanation (if kept)

## Color Scheme

Maintain consistency with existing site:
- **Primary**: Black borders, white backgrounds
- **Accent**: Gold (#D4AF37) for hover states and highlights
- **Text**: Black for primary, gray-700 for secondary
- **Backgrounds**: White, gray-50 for sections

## Responsive Behavior

- **Desktop**: Three cards in a row
- **Tablet**: Three cards in a row (smaller) or 2+1 layout
- **Mobile**: Cards stack vertically, full width

## Dynamic Content Rules

### Status Bar
- Shows current period based on `isSubmissionPeriod()` and `isVotingPeriod()`
- Updates text accordingly

### Submit Card
- **During submission period (1-24)**: 
  - Fully interactive, prominent styling
  - Button text: "立即投稿"
  - Link active
- **Outside submission period**:
  - Muted/disabled appearance
  - Text: "投稿期未开放 (X月X日开放)"
  - Link disabled or shows coming soon message

### Latrine Card
- **During voting period (25-end)**:
  - Button text: "前往投票"
- **Other times**:
  - Button text: "查看稿件"
- Always active/clickable

### Archive Card
- Always active, no dynamic behavior

## Implementation Notes

### Component Structure
```
HomePage
├── StatusBar (new component)
├── HeroSection (simplified)
├── MainActionCards (new component)
│   ├── SubmitCard
│   ├── LatrineCard
│   └── ArchiveCard
├── AboutSection (moved down)
├── ProcessSection (optional/simplified)
└── Footer
```

### Key Changes from Current Implementation
1. Remove the large status box from hero section
2. Remove the three non-clickable process cards
3. Remove the small CTA section at bottom
4. Add new prominent action cards in hero area
5. Move "关于本刊" section down
6. Simplify or remove detailed process explanation

### Styling Approach
- Use Tailwind utility classes
- Maintain existing font families (Playfair Display serif, Inter sans)
- Keep existing color tokens (gold, black, gray)
- Ensure accessibility (proper contrast, focus states)

## Success Criteria

1. Main navigation actions (Submit/Latrine/Archive) are immediately visible and prominent
2. Status indicator is visible but not dominating the visual center
3. "About" section is in a more appropriate secondary position
4. Entire page feels cleaner and more focused
5. User can quickly understand where to go for their intended action
6. Design maintains consistency with existing site aesthetic

## Why This Design

**Problem**: Current landing page treats informational content (status, process explanation) as primary and navigation as secondary, inverting the actual user need.

**Solution**: Make navigation primary by promoting action cards to hero position. Users visiting the site want to submit, vote, or browse archives - these actions should be the visual focus.

**How to apply**: When implementing, ensure the action cards are the largest, most prominent elements after the title. Everything else (status, about, process) should be visually subordinate.
