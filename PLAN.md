# AJ Holidays — Site Design Plan

Boutique travel studio, HSR Layout, Bengaluru. Lead-generation site.

Status: original concept + 11 design decisions resolved via `/plan-design-review`.
Design system of record: `DESIGN.md` (promoted from `design-system/aj-holidays/MASTER.md`).

---

## 1. Original concept (preserved as written)

**Core visual concept: "The Interactive Globe & Portal."** Interactive, high-detail
3D globe reacting to scroll and cursor, in place of static cards and top navigation.

- **Palette:** obsidian / dark navy `#0B0F19`, translucent glass `rgba(255,255,255,0.05)`,
  cyan `#00F2FE`, copper / warm gold for luxury pins.
- **Type:** geometric sans headings (Plus Jakarta Sans or Outfit) with technical
  monospace labels (coordinates, package IDs).

**Scroll-driven storytelling:**
1. Hero: interactive 3D globe, cursor parallax, glowing destination pins.
2. Phase 1: camera fly-in, section pins, camera flies into a destination pin.
3. Phase 2: glassmorphic bento package cards over the 3D scene; hover re-lights the scene.
4. Phase 3: parametric itinerary builder; scene morphs with the parameters.

**What the concept did well:** art direction is specific to hex and typeface, the motion
concept is sequenced rather than decorative, and the narrative arc (departure, descent,
arrival) is real storyboarding. Initial rating was 8/10 on art direction.

**What it omitted:** every state that is not the happy path, mobile entirely, the
conversion path, trust, dates, and navigation. Initial rating 2/10 on product design.
Combined: **4/10**.

---

## 2. Decisions resolved in this review

| # | Decision | Resolution |
|---|---|---|
| 1.1 | Hero first read | **Brand and headline first.** Globe is atmosphere, biased right; headline owns the left. Passes litmus check 1. |
| 1.2 | Navigation | **Persistent nav bar.** Fixed, glass, opaque on scroll, burger under 768px. Contact always one tap away. |
| 1.3 | Bento order and sizing | **Seasonal window with one manually pinned hero slot.** Big tile always shows something bookable this month. |
| 1.4 | Unmatched destinations | **Closest match plus an explicit custom-request route.** Builder stops implying it can design any trip. |
| 2.1 | First paint | **No loader.** Content renders immediately; globe fades in when ready. Simulated progress bar removed. |
| 2.2 | Weak devices | **Measure real frame timing, freeze to a still frame** on sustained low FPS. Replaces the width-based `lowPower` guess. |
| 2.3 | Enquiry capture | **Real endpoint stores the lead first**, WhatsApp offered as the fast path. Fixes silent loss on blocked popups. |
| 3.1 | Trust | **Real, checkable evidence.** Named reviews, traveller photos, registration number, a named human. |
| 3.2 | Dates | **Travel month plus a flexibility flag**, in both builder and enquiry form. |
| 4.1 | AI-generated look | **One deliberate deviation:** promote copper from price-only to a structural role. |
| 6.1 | Mobile narrative | **No pinning on phones.** Static touch-responsive globe, then linear sections. |
| 5.1 | Design system | *(Recorded, no fork)* Promote `MASTER.md` to `DESIGN.md`, amended for 4.1. |

---

## 3. Information architecture

Reading order per section. First read is largest / brightest / highest contrast.

```
HERO          1. Headline ("We don't sell tickets…")   2. Sub + CTA   3. Globe
              Nav persists above all three.
JOURNEY       1. Phase caption   2. Scene   3. HUD telemetry
              (Desktop only — see §6.)
PACKAGES      1. Hero tile (seasonal)   2. Section title   3. Remaining tiles   4. Fare footnote
BUILDER       1. Match result + price   2. Controls   3. Day list   4. Alternates
STUDIO        1. Address + human   2. Evidence (reviews, registration)   3. Capability list
CONTACT       1. Headline   2. Form   3. Reassurance (response time)
```

**Grid ordering rule (1.3):** sort by seasonal bookability for the current month;
one `pinned: true` package overrides into the hero tile. Big tile = double width and
height. Never let array order decide.

**Wayfinding (1.2):** persistent nav = Packages / Build a trip / Studio / Contact.
Trunk test must pass from any scroll position, including mid-narrative.

**Escape hatch (1.4):** when the builder's best match scores below a confidence
threshold, it must say so plainly and offer "tell us what you actually want" rather
than presenting a confident percentage.

---

## 4. Interaction states

Describes what the **user sees**, not backend behaviour.

| Feature | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Globe hero | Page content renders immediately; globe fades in (2.1) | n/a | Canvas unavailable: hero collapses to type-only, layout unchanged | Globe live, pins pulsing |
| Globe (weak device) | n/a | n/a | Sustained low FPS: freeze to a still frame, stop the loop (2.2) | Full motion |
| Bento grid | Cards render as text first | No package in season: show next-season set, labelled | n/a | Seasonal set with pinned hero |
| Builder | n/a | Below confidence threshold: say "no close match", offer custom route (1.4) | n/a | Match, estimate, day list |
| Builder estimate | n/a | n/a | Over stated budget: show the overrun plainly | Estimate + "indicative, not a quote" |
| Enquiry form | Submit disabled, spinner in button | n/a | Inline per-field errors; **send failure states it plainly and shows phone + email** | Confirmation on page + emailed receipt (2.3) |
| WhatsApp handoff | n/a | n/a | **Popup blocked: show copyable message text.** Lead already stored, so nothing is lost | Thread opens pre-filled |

**Empty states are features.** The no-match state (1.4) gets warmth, a primary action
and context, never "No results found."

---

## 5. User journey

| Step | User does | User feels | Now specified by |
|---|---|---|---|
| 1 | Lands | curiosity | Hero, headline-first (1.1) |
| 2 | Scrolls fly-in | wonder | Journey section (desktop) |
| 3 | Reads packages | interest, price scrutiny | Seasonal grid (1.3) |
| 4 | Asks "are these real people" | **doubt** | Evidence block (3.1) |
| 5 | Builds a trip | agency, play | Builder + dates (3.2) |
| 6 | Decides to enquire | **risk** | Response-time promise, named coordinator |
| 7 | Sends | hope | Confirmation + receipt (2.3) |
| 8 | Waits | **anxiety** | Stated reply window, honoured |

Time horizons: 5 seconds strong, 5 minutes now addressed via trust and dates,
5-year relationship **deferred** (see §8).

---

## 6. Responsive

Not "stacked on mobile". Each viewport gets an intentional design.

| Viewport | Hero | Narrative | Grid | Builder |
|---|---|---|---|---|
| ≥1025px | Globe right, copy left, cursor parallax | **Pinned fly-in**, 340vh | 4-col bento, xl hero tile | Two-column |
| 768–1024px | Globe centred, reduced parallax | Pinned, 280vh | 2-col | Single column |
| ≤767px | **Static globe**, touch-responsive pins, no parallax | **None — linear sections** (6.1) | 1-col | Single column |

Breakpoints verified: 375 / 768 / 1024 / 1440. No horizontal overflow at any width.

---

## 7. Accessibility

- Contrast verified against `#0B0F19`: fg 16.31:1, muted 9.37:1, cyan 13.80:1,
  copper 6.58:1, on-cyan button 13.67:1. All AA or better.
- Touch targets ≥44px with ≥8px separation. Audited at 375 and 768.
- `:focus-visible` always rendered, never removed.
- Form labels visible at all times. Never placeholder-as-label. Errors inline,
  adjacent to the field, focus moves to the first invalid control.
- `prefers-reduced-motion` unpins the narrative entirely, disables parallax and
  pin-tracking, and snaps scene transitions rather than easing them.
- Skip link to `#packages`; skip-intro control inside the pinned sequence.
- Canvas is `aria-hidden`; all destination content exists as real text in the cards.

---

## 8. NOT in scope

| Deferred | Rationale |
|---|---|
| Retention and referral (5-year horizon) | Business model question, not a page-design question |
| Expanding past 8 destinations | Real content work per destination; 1.4's escape hatch covers the gap for now |
| Exact-date capture | Month plus flexibility (3.2) gets most of the value at far less form friction |
| Full brand identity rework | 4.1 chose a targeted deviation; a rebrand needs a proper brand process |
| Touch equivalent for hover-to-preview | Real gap, logged as a TODO rather than solved here |
| Keyboard reach for globe pins | Real gap, logged as a TODO; cards give partial parity today |

---

## 9. What already exists

Reuse rather than rebuild:

- `assets/js/scene.js` — canvas renderer. Public API (`camera`, `focus`, `pointer`,
  `hit`, `redraw`) is the seam; `app.js` never reaches past it.
- `design-system/aj-holidays/MASTER.md` — token table, semantic colour rule,
  verified contrast, and the provenance of the dark-mode override.
- Built and verified already: reduced-motion unpinning, skip control, 44px targets,
  inline validation with focus management, responsive audit at four widths.
- `preview/` — nine reference renders of globe and scene states.

---

## Implementation Tasks

Synthesized from this review's findings. Each derives from a specific decision above.

- [ ] **T1 (P1, human: ~2h / CC: ~15min)** — content — Remove invented trust claims
  - Surfaced by: 3.1 — "4,200 travellers", "97% visa success", "IATA-accredited partner network" are fabricated
  - Files: `index.html`
  - Verify: no unverifiable claim remains in markup
- [ ] **T2 (P1, human: ~1 day / CC: ~1h)** — forms — Store the lead before opening WhatsApp
  - Surfaced by: 2.3 — blocked popup currently reports success while losing the enquiry
  - Files: `assets/js/app.js`, new endpoint
  - Verify: block popups in devtools, confirm lead still recorded and UI tells the truth
- [ ] **T3 (P1, human: ~1 day / CC: ~45min)** — responsive — Drop pinning below 768px
  - Surfaced by: 6.1 — pinned canvas scroll on touch causes jank, heat and viewport jumps
  - Files: `assets/css/style.css`, `assets/js/app.js`
  - Verify: 375px scroll is browser-native; no `position: sticky` on `.journey`
- [ ] **T4 (P2, human: ~2h / CC: ~15min)** — loading — Remove the loader and its fake progress
  - Surfaced by: 2.1 — progress bar animates on a timer unrelated to real load state
  - Files: `index.html`, `assets/css/style.css`, `assets/js/app.js`
  - Verify: headline is painted before the canvas has drawn a frame
- [ ] **T5 (P2, human: ~4h / CC: ~30min)** — perf — Replace `lowPower` heuristic with frame measurement
  - Surfaced by: 2.2 — width-based guess penalises modern phones and misses slow desktops
  - Files: `assets/js/scene.js`
  - Verify: throttle CPU 6x, confirm scene freezes to a still and stops the rAF loop
- [ ] **T6 (P2, human: ~4h / CC: ~30min)** — builder — Add travel month plus flexibility
  - Surfaced by: 3.2 — price is quoted without the input that moves price most
  - Files: `index.html`, `assets/js/app.js`
  - Verify: month reaches the WhatsApp brief and the stored lead
- [ ] **T7 (P2, human: ~3h / CC: ~25min)** — content — Seasonal ordering with pinned hero
  - Surfaced by: 1.3 — big tile currently chosen by array index
  - Files: `assets/js/scene.js` (DEST), `assets/js/app.js`
  - Verify: change system month, confirm hero tile changes
- [ ] **T8 (P2, human: ~2h / CC: ~15min)** — builder — Confidence threshold and custom-request route
  - Surfaced by: 1.4 — unmatched requests get a confident wrong answer
  - Files: `assets/js/app.js`
  - Verify: drive sliders to an unmatched profile, confirm honest no-match copy
- [ ] **T9 (P3, human: ~1 day / CC: ~45min)** — design-system — Promote MASTER.md to DESIGN.md, amend for 4.1
  - Surfaced by: 5.1 — no system of record; 4.1 contradicts the current copper rule
  - Files: `DESIGN.md`, `design-system/aj-holidays/MASTER.md`
  - Verify: copper's structural role documented; no contradictory rule remains
- [ ] **T10 (P3, human: ~30min / CC: ~5min)** — polish — Limit the `◦` glyph to machine-readable labels
  - Surfaced by: 4.1 — repeated ornamental glyph across every section reads as decoration
  - Files: `index.html`, `assets/js/app.js`
  - Verify: glyph remains only on coordinates and package IDs

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | codex not installed |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | NOT RUN | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | ISSUES_OPEN | score: 4/10 → 8/10, 12 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** DESIGN REVIEWED (4/10 → 8/10, 12 decisions recorded). Eng review required before implementation.

**UNRESOLVED DECISIONS:**
- Touch equivalent for hover-to-preview interaction
- Keyboard reachability of globe pins
- Retention and referral strategy (5-year horizon)
- Whether to expand beyond 8 destinations
- Whether to capture exact dates rather than month plus flexibility
