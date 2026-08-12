# AJ Holidays — immersive scrollytelling site

Dark, 3D-feeling marketing site for a boutique travel studio in HSR Layout, Bengaluru.
Interactive point-cloud globe → scroll-driven camera fly-in → glassmorphic bento package
grid → parametric itinerary builder.

**Zero dependencies. No build step.** Open `index.html` through any static server.

```bash
python -m http.server 5173 --directory aj-holidays
```

---

## ⚠️ Placeholder data — replace before launch

Everything below is invented and must be swapped for real business details:

| What | Where | Current value |
|---|---|---|
| Phone / WhatsApp | `assets/js/app.js` → `WA_NUMBER`, `index.html` | `+91 98765 43210` |
| Email | `index.html` (studio card) | `hello@ajholidays.in` |
| Street address | `index.html` (studio card) | 27th Main Rd, Sector 2, HSR Layout |
| All 8 packages: prices, inclusions, night counts | `assets/js/scene.js` → `DEST` | invented, indicative only |

**Removed in T1 (do not reintroduce without real figures):** the hero stats row
(4,200 travellers / 38 countries / 11 years / 97% visa success) and the
"IATA-accredited partner network" eyebrow were fabricated to fill the layout.
Both are gone. `index.html` carries a comment at the old stats location showing
how to restore the row once you have numbers you can stand behind; the CSS and
the `[data-count]` JS counter are still in place, so real figures need no new code.

The contact form has **no backend**. Submitting composes a pre-filled WhatsApp message and
opens `wa.me`. Wire it to a real endpoint (or Formspree/Netlify Forms) before launch.

---

## Structure

```
aj-holidays/
├── index.html
├── assets/css/style.css        design tokens + all layout
├── assets/js/scene.js          canvas renderer (globe + landscapes)
├── assets/js/app.js            scroll orchestration, builder, validation
├── design-system/aj-holidays/  MASTER.md — generated design system + overrides
└── preview/                    reference renders of each scene state
```

### `scene.js` — the renderer

A 2D-canvas engine, not WebGL. Two modes cross-faded by a single `blend` value:

- **Globe** — ~9 000 points generated from a 72×36 (5°) landmass table, projected onto a
  sphere with yaw/pitch rotation and perspective divide. Great-circle flight arcs from
  Bengaluru, pulsing destination pins, collision-culled monospace coordinate labels.
- **Landscape** — procedural sky gradient, sun/moon with bloom, water plane with a radial
  reflection pool, four parallax ridge layers, and a per-destination silhouette
  (`towers` / `peaks` / `palms` / `isles` / `pagoda`).

Palettes interpolate between destinations, so hovering a package card morphs the whole
scene. Landmarks are discrete shapes so they cross-fade by opacity rather than interpolating.

Public API:

```js
AJScene.init(canvas, {reduced, lowPower})
AJScene.camera({zoom, blend, drift, hard})  // hard:true snaps instead of easing
AJScene.focus(index, hard)                  // aim at a destination
AJScene.pointer(nx, ny)                     // −1…1 parallax
AJScene.hit(x, y) → index | −1              // pin hit-test in CSS px
AJScene.setHover(i) / redraw() / start() / stop()
```

Measured **1.9 ms/frame** at 885×560 on desktop — comfortably inside a 60 fps budget.

### Scroll choreography

Driven entirely by scroll position (no library, no scroll-jacking). Verified values:

| Scroll position | zoom | blend | caption |
|---|---|---|---|
| hero top | 1.00 | 0 | — |
| journey 20% | 1.57 | 0 | 1 |
| journey 50% | 4.07 | 0.03 | 2 |
| journey 75% | 5.74 | 0.90 | 3 |
| journey 100% → end | 5.74 | 1 | — |

---

## Design system

Generated with `ui-ux-pro-max` and persisted to `design-system/aj-holidays/MASTER.md`.
Resolved pattern **Immersive/Interactive Experience**, style **Bento Grids**.

**The palette is a documented manual override.** The tool's colour database has no
dark-mode travel/hospitality entry — every hospitality and luxury row is a light-background
palette — so it returned sky-blue `#0EA5E9` on `#F0F9FF`. The brief is dark-first, so the
palette in use ("Obsidian / Ion / Copper") comes from built-in dark-mode defaults plus the
brief, **not** from a database match. Contrast was verified manually:

| Pair | Ratio |
|---|---|
| `#E8EDF7` on `#0B0F19` (body) | 16.31:1 AAA |
| `#A8B6D1` on `#0B0F19` (muted) | 9.37:1 AAA |
| `#00F2FE` on `#0B0F19` (cyan) | 13.80:1 AAA |
| `#C98A4B` on `#0B0F19` (copper) | 6.58:1 AA |
| `#04121A` on `#00F2FE` (button) | 13.67:1 AAA |

Semantic rule: **cyan = interactive** (nav, focus, active), **copper = value** (price,
luxury tier). Copper is never an affordance — two "clickable" colours would compete.

Typography is Outfit (geometric display/body) + JetBrains Mono for technical labels,
restricted to 11–13 px, uppercase, `0.16em` tracking, weight 400 only.

### Accessibility

- Skip link, single `h1`, `lang`, visible `:focus-visible` rings (never removed)
- All touch targets ≥ 44 px, ≥ 8 px apart — audited at 375 / 768 / 1440
- No horizontal overflow at any breakpoint
- Inline per-field errors adjacent to the input, `aria-invalid`, focus moves to the first
  invalid control on submit
- **Skip intro** control on the pinned sequence (required by the Immersive pattern)
- `prefers-reduced-motion` **unpins the scrollytelling entirely** — the journey becomes
  static stacked sections, parallax and pin-tracking are disabled, and the scene snaps
  instead of easing

---

## Migrating to Three.js

The brief called for Three.js. It was deliberately not used: the whole page is ~30 KB and
renders on first paint, versus ~600 KB of runtime before anything appears. If you later
want real volumetric depth, the seam is clean — `scene.js` is the only file to replace, and
`app.js` talks to it exclusively through the API above.

Recommended stack: Next.js + `@react-three/fiber` + `drei` + GSAP ScrollTrigger (`scrub: 1`
for the camera path, per the stack guidance) + Lenis for smooth scroll. Keep the
`prefers-reduced-motion` branch — with ScrollTrigger you must skip `pin` entirely, not just
shorten durations. Call `ScrollTrigger.refresh()` after fonts and textures load.

## Known limitations

- Landmass data is a hand-built 5° table (~47% land cells). Recognisable at globe scale,
  but it is not survey-accurate — coastlines are blocky at high zoom.
- Google Fonts load from CDN; system fallbacks are declared, so the page degrades gracefully
  offline, but it will not be pixel-identical.
- `preview/` renders were captured at 885×560; they are reference images, not assets used
  by the site. Safe to delete.
