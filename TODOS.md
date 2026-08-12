# TODOS — AJ Holidays

Design debt surfaced by `/plan-design-review`. Items deferred from the plan, not
dropped. Each is real work with a real reason; none are speculative.

---

## 1. Touch equivalent for hover-to-preview

**What:** Give phones a way to trigger the scene re-light that desktop gets on card hover.

**Why:** Hovering a package card re-lights the 3D scene behind it. That interaction is
the link between the grid and the globe, and it is the reason the scene exists below the
hero. On touch there is no hover, so the connection silently disappears for most visitors.

**Pros:** Restores the concept's best structural idea on the device that dominates travel
research. Likely cheap: intersection-based activation as a card scrolls to centre.

**Cons:** Scroll-triggered scene changes can feel busy on a small screen, and it re-adds
per-frame canvas work on mobile that decision 6.1 was partly trying to avoid.

**Context:** Decision 6.1 removed pinning below 768px but left the static globe in place.
This TODO is about the packages section, not the hero.

**Depends on:** T3 (drop pinning) and T5 (frame measurement) should land first, so
mobile scene cost is measured rather than assumed.

---

## 2. Keyboard reachability of globe pins

**What:** Make the destination pins operable without a mouse.

**Why:** Pins are drawn pixels on a canvas, so they cannot be tabbed to. Clicking one
seeds the builder and jumps to it, which is a real shortcut that keyboard users cannot
reach. Card focus already re-lights the scene, so parity is partial but incomplete.

**Pros:** Closes a genuine accessibility gap in the one interactive element that is not
already real DOM. Likely solved with a visually-hidden button list mapped to the pins.

**Cons:** Duplicates destination data into a second focusable structure that must stay in
sync with `DEST`.

**Context:** All destination *content* is already accessible as text in the bento cards,
so this is about the shortcut, not about content being unreachable.

**Depends on:** Nothing.

---

## 3. Retention and referral

**What:** Decide whether the site does anything after a trip is booked.

**Why:** The journey storyboard ends at "enquiry sent". Norman's reflective level, the
5-year relationship, is unaddressed. For a boutique studio, repeat customers and word of
mouth are likely the cheapest acquisition channel available.

**Pros:** Would give the highest-value visitors, past customers, a reason to return, and
feeds directly into the real-reviews work in T1 and decision 3.1.

**Cons:** Genuinely a business-model question. Building UI before deciding the strategy
would be building the wrong thing well.

**Context:** Explicitly out of scope for a design review. Raised because the journey
review found it, not because this plan should solve it.

**Depends on:** A decision from the business, not from design.

---

## 4. Expand beyond 8 destinations

**What:** Add real destinations so the builder has genuine range.

**Why:** The builder can only ever return one of eight fixed packages. Decision 1.4 added
an honest escape hatch, which stops the overpromise but does not add capability.

**Pros:** Every destination is also a new organic search surface for "Bali package from
Bangalore" style queries. Fixes the cause rather than the symptom.

**Cons:** Real content work per destination: pricing, inclusions, day-by-day, and a scene
palette. It never fully closes, since there will always be a destination you do not list.

**Context:** Considered and deliberately deferred in 1.4 in favour of the escape hatch.

**Depends on:** T8 (confidence threshold) so the honest path exists first.

---

## 5. Exact-date capture

**What:** Replace month plus flexibility with a real date range.

**Why:** Month gets most of the pricing signal, but availability conflicts, visa lead
times and fare classes all need actual dates. Today those surface in conversation.

**Pros:** Makes the first reply a quote rather than a question, which is a meaningful
speed advantage on WhatsApp where momentum matters.

**Cons:** Real friction on a lead form, and asks for certainty most people browsing
holidays months ahead simply do not have yet.

**Context:** 3.2 chose month plus flexibility on friction grounds. Revisit if enquiries
routinely stall on date clarification.

**Depends on:** T6 (month capture) shipping first, so there is data on whether it is enough.
