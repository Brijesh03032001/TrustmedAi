# TrustMed-AI Frontend Improvement Plan
> Target: Premium Healthcare AI Interface — Calm Clinical Aesthetic

---

## Current State Summary

| File | Current Design | Problem |
|------|---------------|---------|
| `theme.ts` | Dark cyberpunk — electric cyan #00d4ff, hot pink #ff006e | Wrong mood for healthcare |
| `globals.css` | 19 lines, barely used | No design system foundation |
| `LandingPage.tsx` | Neon glows, radial dark gradients | Not calming or trustworthy |
| `ChatInterface.tsx` | Dark glass, neon bubbles, `dangerouslySetInnerHTML` XSS | Security risk + wrong tone |
| `DiseasesBrowser.tsx` | Dark glassmorphic grid | Inconsistent with target palette |
| `AppLayout.tsx` | Neon sidebar, "Neural Core" branding | Feels cyberpunk not clinical |
| `SearchPanel.tsx` | Neon dark search | Not aligned with target |
| `diseases/[id]/page.tsx` | Cyan/pink color-coded sections | Harsh for medical content |

**Root problem:** The entire app uses a **dark cyberpunk neon** palette. The target requires a **light, calm, clinical soft-glass** aesthetic.

---

## Target Design System

### Color Tokens (replace all current hardcoded colors)

```ts
// src/lib/tokens.ts  (new file to create)
export const tokens = {
  primary:    '#2563EB',   // Primary Blue
  teal:       '#14B8A6',   // AI Teal
  mint:       '#DFF7F2',   // Soft Mint
  bg:         '#F8FAFC',   // Page Background
  surface:    '#FFFFFFCC', // Frosted Card
  textPrimary:'#0F172A',   // Dark Slate
  textSecondary:'#64748B', // Medium Slate
  border:     '#DCE7F3',   // Light Blue Border
  purple:     '#7C3AED',   // AI Accent Purple
  success:    '#22C55E',
  warning:    '#F59E0B',
  danger:     '#EF4444',
}

export const gradients = {
  background: 'linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 45%, #DFF7F2 100%)',
  aiGlow:     'linear-gradient(135deg, #2563EB, #14B8A6, #7C3AED)',
  card:       'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(223,247,242,0.4))',
  button:     'linear-gradient(135deg, #2563EB, #14B8A6)',
}
```

---

## File-by-File Improvement Plan

---

### 1. `src/lib/theme.ts` — Full Replacement

**What changes:**
- Replace all dark background values with light surface colors
- Replace neon primaries (#00d4ff, #ff006e) with clinical blues and teals
- Change `background.default` from `#0a0a0f` → `#F8FAFC`
- Change `background.paper` from dark rgba → `rgba(255,255,255,0.8)` with backdrop blur
- Update `borderRadius` to 20px (from 16px)
- Change all MuiCard overrides to use light glassmorphism

**Key changes in detail:**

```ts
// BEFORE
palette: {
  primary: { main: '#00d4ff' },
  background: { default: '#0a0a0f', paper: 'rgba(17,25,40,0.9)' }
}

// AFTER
palette: {
  primary: { main: '#2563EB' },
  background: { default: '#F8FAFC', paper: 'rgba(255,255,255,0.8)' }
}
```

- Update `MuiCard` hover: replace neon border glow with soft `#DCE7F3` shadow lift
- Update `MuiButton`: replace hot-pink gradient with `linear-gradient(135deg, #2563EB, #14B8A6)`
- Update `MuiTextField`: replace cyan focus glow with soft `#2563EB` ring (0 0 0 3px rgba(37,99,235,0.15))
- Update `MuiChip`: replace gradient with soft mint/blue fills

---

### 2. `src/app/globals.css` — Expand Significantly

**What to add:**

```css
/* Background gradient on html/body */
body {
  background: linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 45%, #DFF7F2 100%);
  background-attachment: fixed;
  color: #0F172A;
  font-family: 'Inter', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Frosted glass utility */
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(220, 231, 243, 0.6);
  border-radius: 24px;
}

/* AI ambient glow */
.ai-glow {
  box-shadow: 0 0 40px rgba(20, 184, 166, 0.12), 0 0 80px rgba(37, 99, 235, 0.06);
}

/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Accessibility: reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F1F5F9; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
```

---

### 3. `src/components/layout/AppLayout.tsx` — Redesign Sidebar

**What changes:**

| Element | Before | After |
|---------|--------|-------|
| Sidebar background | `rgba(3,6,15,0.95)` dark | `rgba(255,255,255,0.85)` frosted white |
| Sidebar border | Cyan glow border | `1px solid #DCE7F3` |
| Logo text | Neon cyan gradient | `linear-gradient(135deg, #2563EB, #14B8A6)` |
| Active nav item | Cyan border + neon glow | Soft blue bg `#EFF6FF` + `#2563EB` left border |
| "Neural Core" status | Neon pulse badge | Soft teal `#14B8A6` dot with gentle pulse |
| Footer | Dark gradient | Light mint `#F0FDF9` |
| Floating icon | Hot pink glow | Blue `#2563EB` subtle shadow |

**Specific sx changes:**
```tsx
// Drawer Paper
sx={{
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(24px)',
  borderRight: '1px solid #DCE7F3',
  boxShadow: '4px 0 24px rgba(37,99,235,0.06)',
}}

// Active nav item
sx={{
  background: '#EFF6FF',
  borderLeft: '3px solid #2563EB',
  borderRadius: '0 16px 16px 0',
  color: '#2563EB',
}}
```

---

### 4. `src/components/landing/LandingPage.tsx` — Visual Overhaul

**What changes:**

| Section | Before | After |
|---------|--------|-------|
| Page background | Dark radial gradients | `linear-gradient(135deg, #F8FAFC, #E0F2FE, #DFF7F2)` |
| Hero title color | Neon cyan gradient | `linear-gradient(135deg, #2563EB, #14B8A6, #7C3AED)` |
| Subtitle text | Light with text-shadow glow | `#64748B` — clean, no glow |
| Feature cards | Dark glass `rgba(17,25,40,0.8)` | White frosted `rgba(255,255,255,0.85)` |
| CTA Primary | Neon cyan | `linear-gradient(135deg, #2563EB, #14B8A6)` |
| CTA Secondary | Hot pink | `border: 2px solid #2563EB`, text `#2563EB` |
| Stats section | Dark glass | Soft mint `#DFF7F2` cards with `#0F172A` text |
| Floating background elements | None | Subtle molecule/circle patterns in `#E0F2FE` |

**Remove:**
- All `radial-gradient(ellipse at ... rgba(0,212,255,...))` neon glow overlays
- `textShadow` on hero title (replace with gradient clip)
- Dark rgba backgrounds on glass cards

**Add:**
- Subtle ambient light blobs in background (CSS animated, very low opacity)
- Particle-like floating medical cross icons at 4% opacity
- Entrance animations using Framer Motion with `prefers-reduced-motion` check:
  ```tsx
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ```

---

### 5. `src/components/chat/ChatInterface.tsx` — Security Fix + Redesign

**Critical security fix first:**
```tsx
// REMOVE this (XSS vulnerability):
<div dangerouslySetInnerHTML={{ __html: formatMessage(msg.answer) }} />

// REPLACE with react-markdown (already in package.json):
import ReactMarkdown from 'react-markdown'
<ReactMarkdown>{msg.answer}</ReactMarkdown>
```

**Visual changes:**

| Element | Before | After |
|---------|--------|-------|
| Chat background | Dark | Full-height mint gradient |
| User message bubble | Dark glass + hot pink gradient | Soft `linear-gradient(135deg, #2563EB, #1D4ED8)` white text |
| AI message bubble | Dark `rgba(17,25,40,0.8)` | White frosted `rgba(255,255,255,0.9)` with `#DCE7F3` border |
| AI avatar | Cyan glow | Teal `#14B8A6` with white cross icon |
| Input area | Dark glass at bottom | White card with `#DCE7F3` border, pill shape |
| Send button | Hot pink gradient | `#2563EB` circle button |
| Source links | Neon pills | Soft `#EFF6FF` pills with `#2563EB` text |
| Confidence chips | Neon gradients | Mint/green/amber based on value |
| Typing indicator | Cyan dots | Teal `#14B8A6` gentle bounce dots |
| Sample questions | Neon bordered chips | `#F1F5F9` subtle rounded chips |

**Add:**
- Message timestamp display (formatted with `Intl.DateTimeFormat`)
- Copy-to-clipboard button on AI messages (hover-reveal)
- "Regenerate response" button on last AI message
- Character count display on input (max 500)

---

### 6. `src/components/diseases/DiseasesBrowser.tsx` — Redesign

**What changes:**

| Element | Before | After |
|---------|--------|-------|
| Page background | Dark glass container | Transparent (inherits body gradient) |
| Header section | Dark gradient + cyan border-top | White frosted glass, `#2563EB` gradient top border (3px) |
| Search input | Dark glass | White input, `#DCE7F3` border, `#2563EB` focus ring |
| Category chips | Neon-colored glass chips | Soft pastel fills per category, `#0F172A` text |
| Disease cards | Dark `rgba(10,10,25,0.8)` | White `rgba(255,255,255,0.9)`, `#DCE7F3` border |
| Card hover | Neon glow + lift | Soft shadow lift + `#2563EB` left border accent |
| Pagination | Neon | `#2563EB` active, `#64748B` inactive |
| Skeleton loaders | Dark skeleton | Light `#E2E8F0` skeletons |
| Stats chips | Neon | Soft `#EFF6FF` with `#2563EB` text |

**Add:**
- Entrance animations: cards stagger in with `opacity: 0 → 1, y: 20 → 0` (Framer Motion)
- Empty state illustration when no results (SVG medical icon + message)
- URL-synced filters (`?category=cardiovascular&search=heart`)

---

### 7. `src/components/search/SearchPanel.tsx` — Redesign

**What changes:**

| Element | Before | After |
|---------|--------|-------|
| Search header | Dark glass box | White frosted card with gradient top accent |
| Search input | Dark glass | Large pill-shaped white input, prominent shadow |
| Quick search chips | Neon | Soft `#F1F5F9` chips, `#64748B` text |
| Result cards | Dark glass | White frosted, same as disease cards |
| "Ask AI" button | Neon gradient | `linear-gradient(135deg, #2563EB, #14B8A6)` |
| "View" button | Cyan outline | `#64748B` outline, hover fills `#EFF6FF` |
| Results count | Neon text | `#64748B` secondary text |

**Add:**
- Staggered entrance for result cards (delay: index * 0.05s)
- Search result highlighting (bold matched term in result title)
- URL persistence for search query

---

### 8. `src/app/diseases/[id]/page.tsx` — Section Redesign

**What changes:**

| Section | Before | After |
|---------|--------|-------|
| Breadcrumbs | Cyan links | `#2563EB` links, `#64748B` separator |
| Header card | Dark glass, cyan gradient border | White frosted, AI glow gradient top border |
| Section cards | Dark glass with colored left borders | White frosted, color-coded `#2563EB`/`#14B8A6`/`#7C3AED` left accent |
| Section icons | Hardcoded neon colors | Consistent palette: blue, teal, purple, amber, red |
| Symptom list | Dark backgrounds | `#F0FDF9` mint pill chips |
| Medicine/treatment | Orange accents | `#F59E0B` amber accents |
| Source link button | Orange gradient | `#2563EB` outlined pill button |
| Error state | Neon Alert | Soft `#FEF2F2` card with `#EF4444` accent |
| Loading | Cyan CircularProgress | `#2563EB` CircularProgress |

**Add:**
- Share button (copy URL to clipboard)
- "Ask AI about this" CTA button (links to `/chat?q=Tell me about [disease]`)
- Trust indicators (verified badge + "Data from Mayo Clinic" label)

---

### 9. Delete `SearchPanel_Fixed.tsx`

This file is duplicate code. It should be **deleted** and all imports replaced with `SearchPanel.tsx`.

```bash
rm TrustMed-AI/src/components/search/SearchPanel_Fixed.tsx
```

---

## Implementation Order

```
Phase 1 — Foundation (do first, everything depends on this)
  1. Create src/lib/tokens.ts
  2. Rewrite src/lib/theme.ts
  3. Update src/app/globals.css

Phase 2 — Layout Shell
  4. Redesign AppLayout.tsx sidebar

Phase 3 — Pages (highest impact first)
  5. LandingPage.tsx (first impression)
  6. ChatInterface.tsx (core feature + security fix)
  7. DiseasesBrowser.tsx
  8. SearchPanel.tsx
  9. diseases/[id]/page.tsx

Phase 4 — Cleanup
  10. Delete SearchPanel_Fixed.tsx
  11. Update all page.tsx wrappers with metadata
  12. Add prefers-reduced-motion checks everywhere
```

---

## Accessibility Checklist (apply across all files)

- [ ] All interactive elements have `aria-label`
- [ ] Color contrast ratio ≥ 4.5:1 for all text
- [ ] Focus rings visible (`outline: 2px solid #2563EB`)
- [ ] `prefers-reduced-motion` respected
- [ ] Semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)
- [ ] Images have `alt` text
- [ ] Form fields have associated labels

---

## Security Fix (Priority: CRITICAL)

In `ChatInterface.tsx`, remove `dangerouslySetInnerHTML` and replace with `react-markdown`:

```tsx
// Install already present in package.json: "react-markdown": "^10.1.0"
import ReactMarkdown from 'react-markdown'

// Replace:
<div dangerouslySetInnerHTML={{ __html: formatMessage(msg.answer) }} />

// With:
<ReactMarkdown
  components={{
    p: ({ children }) => <Typography variant="body1">{children}</Typography>,
    strong: ({ children }) => <strong style={{ color: '#0F172A' }}>{children}</strong>,
  }}
>
  {msg.answer}
</ReactMarkdown>
```

---

## Typography Updates

Replace all hardcoded `fontFamily` references:

```ts
// theme.ts
typography: {
  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  h1: { fontWeight: 700, letterSpacing: '-0.025em', color: '#0F172A' },
  h2: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' },
  h3: { fontWeight: 600, letterSpacing: '-0.015em', color: '#0F172A' },
  h4: { fontWeight: 600, color: '#0F172A' },
  h5: { fontWeight: 600, color: '#0F172A' },
  h6: { fontWeight: 600, color: '#0F172A' },
  body1: { color: '#0F172A', lineHeight: 1.7 },
  body2: { color: '#64748B', lineHeight: 1.6 },
  caption: { color: '#64748B', letterSpacing: '0.02em' },
}
```

---

## Summary of Impact

| Change | Files Affected | Priority |
|--------|---------------|----------|
| Fix XSS vulnerability | `ChatInterface.tsx` | 🔴 CRITICAL |
| Replace dark theme with light clinical | `theme.ts`, all components | 🔴 HIGH |
| Add tokens file | `tokens.ts` (new) | 🔴 HIGH |
| Expand globals.css | `globals.css` | 🟡 HIGH |
| Redesign sidebar | `AppLayout.tsx` | 🟡 HIGH |
| Redesign landing page | `LandingPage.tsx` | 🟡 HIGH |
| Redesign chat UI | `ChatInterface.tsx` | 🟡 HIGH |
| Add reduced-motion support | All animated components | 🟡 MEDIUM |
| Delete duplicate SearchPanel_Fixed | `SearchPanel_Fixed.tsx` | 🟢 LOW |
| Add URL-synced filters | `DiseasesBrowser`, `SearchPanel` | 🟢 LOW |
