# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** AJ Holidays
**Generated:** 2026-07-29 03:06:25
**Category:** Travel/Tourism Agency
**Design Dials:** Variance 8/10 (Bold / Asymmetric) | Motion 9/10 (Complex) | Density 5/10 (Standard)

---

## Global Rules

### Color Palette

> **⚠️ MANUAL OVERRIDE — READ THIS FIRST.**
> The generated palette below the line was the DB's best match (`Travel/Tourism` → sky blue
> `#0EA5E9` + adventure orange on a `#F0F9FF` light background). It is **not used**. This product
> is dark-first by brief ("deep space obsidian, translucent glass, cyan accents, copper luxury
> pins") and `colors.csv` contains no dark-mode travel/hospitality entry — every hospitality and
> luxury row is a light-background palette. The palette in use is therefore **built-in dark-mode
> defaults + the client brief, not a database match.** Contrast was verified manually (WCAG 2.1
> relative luminance) rather than inherited from the DB's `[adjusted for WCAG 3:1]` notes.

#### Palette in use — "Obsidian / Ion / Copper"

| Role | Hex | CSS Variable | Contrast on `#0B0F19` |
|------|-----|--------------|------------------------|
| Background (void) | `#0B0F19` | `--bg` | — |
| Surface (glass fill) | `rgba(255,255,255,.05)` | `--glass` | over `#131A29` elevated |
| Elevated solid | `#131A29` | `--elev` | — |
| Foreground | `#E8EDF7` | `--fg` | **16.31:1** AAA |
| Muted foreground | `#A8B6D1` | `--fg-muted` | **9.37:1** AAA |
| Dim / metadata | `#93A2BF` | `--fg-dim` | **7.44:1** AAA |
| Primary / Ion cyan | `#00F2FE` | `--cyan` | **13.80:1** AAA |
| On primary | `#04121A` | `--on-cyan` | 13.67:1 on cyan — AAA |
| Accent / Copper | `#C98A4B` | `--copper` | **6.58:1** AA |
| Accent light (text-safe) | `#E0A868` | `--copper-lt` | **9.09:1** AAA |
| Border | `rgba(255,255,255,.10)` | `--line` | non-text, ≥3:1 UI |
| Ring (focus) | `#00F2FE` | `--ring` | 13.80:1 — never removed |
| Destructive | `#FF6B6B` | `--bad` | 6.5:1 AA |

**Semantic rule:** cyan = system/interactive (nav, focus, active states, data). Copper = luxury/value
(price, premium tier pins, testimonial marks). Never use copper for interactive affordance — it reads
as decoration and would create two competing "clickable" colors.

#### Typography in use

Brief asked for geometric sans + technical mono. DB's `Crypto/Web3` row (Orbitron + Exo 2) is the
closest futuristic match but Orbitron is a display face that fails at paragraph sizes, and `Inter/Inter`
from the design-system run has no geometric character. Used instead, per brief:

- **Display/Heading:** Outfit (geometric, 200–700) — matches the brief's Plus Jakarta/Outfit call
- **Body:** Outfit 300/400 at 16px base, line-height 1.6
- **Technical labels:** JetBrains Mono 300/400 — DB `Terminal CLI Monospace` row, applied to its
  documented use: coordinates, package IDs, HUD readouts, price meta. **Uppercase + `0.16em`
  tracking, 11–13px only.** Per that row's note: weight 400 only, never bold.

**CSS Import (in use):**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
```

---

<details>
<summary>Original generated palette + typography (superseded — kept for provenance)</summary>

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0EA5E9` | `--color-primary` |
| On Primary | `#0F172A` | `--color-on-primary` |
| Secondary | `#38BDF8` | `--color-secondary` |
| Accent/CTA | `#EA580C` | `--color-accent` |
| Background | `#F0F9FF` | `--color-background` |
| Foreground | `#0C4A6E` | `--color-foreground` |
| Muted | `#E8F2F8` | `--color-muted` |
| Border | `#BAE6FD` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#0EA5E9` | `--color-ring` |

**Color Notes:** Sky blue + adventure orange [Accent adjusted from #F97316 for WCAG 3:1]
**Typography:** Inter / Inter — spatial, legible, glass, system, clean, neutral

</details>

### Spacing Variables

*Density: 5/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #EA580C;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0EA5E9;
  border: 2px solid #0EA5E9;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F0F9FF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0EA5E9;
  outline: none;
  box-shadow: 0 0 0 3px #0EA5E920;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Bento Grids

**Keywords:** Apple-style, modular, cards, organized, clean, hierarchy, grid, rounded, soft

**Best For:** Product features, dashboards, personal sites, marketing summaries, galleries

**Key Effects:** Hover scale (1.02), soft shadow expansion, smooth layout shifts, content reveal

### Page Pattern

**Pattern Name:** Immersive/Interactive Experience

- **Conversion Strategy:** 40% higher engagement. Performance trade-off. Provide skip option. Mobile fallback essential.
- **CTA Placement:** After interaction complete + Skip option for impatient users
- **Section Order:** 1. Full-screen interactive element, 2. Guided product tour, 3. Key benefits revealed, 4. CTA after completion

---

## Motion

**Scroll Reveal** (Complex) — Trigger: scroll (continuous scrub) | Duration: tied to scroll position | Easing: `none (scrub-driven)`

```js
gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=150%', scrub: 1, pin: true } }).from('.headline', { opacity: 0, y: 40 }).to('.bg-layer', { yPercent: -20 }, '<');
```

**Framework notes:** Pinning needs the section to have deterministic height; recalc ScrollTrigger.refresh() after images/fonts load

- ✅ Use scrub: true or a small number (0.5-1.5) instead of instant jumps so it feels tied to the scrollbar
- ❌ Don't pin more than 1-2 sections per page; excessive pinning fights native scroll feel and hurts mobile UX
- ⚡ Pinning forces layout reflow; test on mid-tier mobile devices, not just desktop

---

## Anti-Patterns (Do NOT Use)

- ❌ Generic photos
- ❌ Complex booking

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
