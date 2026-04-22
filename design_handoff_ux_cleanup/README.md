# Handoff: Wanderlust UX Cleanup

## Overview

This is a full-flow redesign of the **family-adventure-planner** app (Wanderlust). The audit found three structural UX problems:

1. **Too many equal-weight buttons.** Every screen has 2–3 black-on-black CTAs competing for attention. The eye never knows where to go.
2. **Brutalist borders on everything.** 2.5px boxes around every card, input, and list item turn the UI into a cage. Hierarchy collapses.
3. **Group dynamics are invisible.** It's a group-travel app, but you never *feel* the group. No live presence, nudges, or shared progress.

The redesign keeps the paper+serif DNA but introduces a proper type scale, hairline dividers, exactly one primary CTA per screen, and playful group-aware touches (progress pips, nudge buttons, live vote tallies, celebratory "decided" screen).

## About the Design Files

The HTML/JSX files in this bundle are **design references**, not production code. They were built with inline React + Babel for rapid prototyping. The task is to **recreate these designs in the family-adventure-planner codebase** using its existing environment (React + Vite + TypeScript, based on `src/main.tsx`), its existing component patterns, and its existing routing.

The CSS in `styles.css` IS intended to be lifted more-or-less directly — the design tokens and utility classes are production-quality and framework-agnostic. Port it into whatever styling approach the repo uses (CSS modules, Tailwind config, styled-components theme, etc.).

## ⚠️ BEFORE YOU START — Preserve the before-state

**The user is writing blog posts about building this app and needs the original design preserved for before/after screenshots.** Do not skip this step.

Run these commands from the repo root **before making any code changes**:

```bash
# 1. Make sure working tree is clean (commit or stash first if not)
git status

# 2. Tag the current state so it's permanently retrievable
git tag -a v0-original-design -m "Original design, pre-UX-cleanup redesign"
git push origin v0-original-design

# 3. Create an archive branch so a preview deploy of the old UI stays live
git checkout -b archive/original-design
git push -u origin archive/original-design

# 4. Return to main (or whatever the default branch is) to do the redesign
git checkout main   # or: git checkout master / main branch name

# 5. Create a working branch for the redesign
git checkout -b redesign/ux-cleanup
```

After this, the user can always:
- `git checkout v0-original-design` to see the old code
- Visit the `archive/original-design` branch's preview URL (Vercel/Netlify auto-deploy previews)
- Compare via `git diff v0-original-design..HEAD`

**Confirm with the user that the tag + branch push succeeded before proceeding with the redesign.**

---

## Fidelity

**High-fidelity.** Pixel values, colors, type sizes, and spacing are all final. Recreate pixel-perfectly using the codebase's existing libraries. Only the *mechanics* of components (state management, API calls, routing) need to be wired to the real app — the *look* is done.

---

## Design Tokens

Port these into the repo's existing token system (CSS variables, Tailwind theme, or styled-components theme).

### Colors

```css
/* Surface tones — warm paper */
--paper:    #FFFDF7;   /* primary surface */
--paper-2:  #F7F3EA;   /* subtle page bg, modal backdrop */
--paper-3:  #EDE8DC;   /* deeper section bg */

/* Ink (text) */
--ink:      #1A1A1A;   /* primary text */
--ink-2:    #5A5752;   /* secondary text, warmer high-contrast gray */
--ink-3:    #8F8A80;   /* tertiary text, placeholders */
--ink-4:    #C4BFB3;   /* disabled, hairline borders */
--hairline: #E6E0D2;   /* internal dividers */

/* Accents */
--coral:    #D85A30;   /* primary brand accent */
--coral-bg: #FBE9E3;
--coral-fg: #993C1D;

--green:    #1D9E75;   /* success, "submitted", positive match */
--green-bg: #E3F2EC;
--green-fg: #0F6E56;

--amber:    #EF9F27;   /* attention, action-needed */
--amber-bg: #FEF4E2;
--amber-fg: #9A6410;

--plum:     #7F77DD;   /* tertiary, rarely used */
```

### Typography

Load from Google Fonts (already in `index.html`):
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
--f-display: 'Fraunces', Georgia, serif;           /* headlines, hero numbers, city names */
--f-sans:    'DM Sans', system-ui, sans-serif;     /* body text, buttons, inputs */
--f-mono:    'IBM Plex Mono', monospace;           /* eyebrow labels, meta, trip codes */
```

**Type scale** (key sizes used in the designs):
- Hero display: 52–64px, Fraunces 400, letter-spacing -0.035em, line-height 0.95–1.05
- H1: 32–40px, Fraunces 400–500, letter-spacing -0.02em
- H2: 26–30px, Fraunces 500
- Body: 14–15px, DM Sans 400, line-height 1.55
- Secondary body: 13px, DM Sans 400, color var(--ink-2)
- Eyebrow/label: 10px, IBM Plex Mono 500, letter-spacing 0.18em, UPPERCASE
- Mono meta: 11px, IBM Plex Mono 400, letter-spacing 0.1em

**Italic accent pattern:** One word per headline gets italicized + recolored coral. E.g., *"Where should we all **meet?**"* — the word `meet?` is Fraunces italic in `var(--coral)`.

### Spacing Rhythm

```css
--s-1:  4px;   --s-2:  8px;   --s-3: 12px;   --s-4: 16px;
--s-5: 20px;   --s-6: 24px;   --s-7: 32px;   --s-8: 40px;
--s-9: 56px;   --s-10: 72px;
```

Screen-level padding is consistently **28px horizontal**. Section-to-section gaps are typically 22–28px vertical.

### Border Radius

- Inputs, chips, small buttons: 999px (pill) or 10px
- Cards: 10–14px
- Modals: 16px
- Avatar: 50%
- Heavy containers: 16–20px

### Shadows

- Card: `0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)`
- Modal: `0 20px 60px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)`
- Primary button hover: `0 6px 16px rgba(0,0,0,0.15)`
- Device frame (design-canvas only — not needed in app): `0 30px 80px rgba(0,0,0,.22)`

---

## Component Library

### Buttons — strict 3-tier hierarchy

**Rule: exactly ONE primary (coral) per screen. Everything else is ghost or text.**

```css
/* Primary — pill, coral, use sparingly */
.btn-primary.coral {
  background: var(--coral); color: var(--paper);
  border: none; border-radius: 999px;
  padding: 12px 22px; font: 500 14px 'DM Sans';
  transition: transform 160ms, background 160ms, box-shadow 160ms;
}
.btn-primary.coral:hover { background: #c24e28; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.15); }

/* Secondary — ghost with ink border */
.btn-ghost {
  background: transparent; color: var(--ink);
  border: 1.5px solid var(--ink); border-radius: 999px;
  padding: 11px 20px; font: 500 13px 'DM Sans';
}
.btn-ghost:hover { background: var(--ink); color: var(--paper); }

/* Tertiary — text link, always mono */
.btn-text {
  background: none; border: none; padding: 0;
  font: 500 11px 'IBM Plex Mono';
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--ink-2);
}
.btn-text:hover { color: var(--ink); }
```

### Inputs

Underline-only. No boxed inputs.

```css
.input {
  width: 100%; background: var(--paper); color: var(--ink);
  border: none; border-bottom: 1.5px solid var(--ink-4);
  font: 16px 'DM Sans'; padding: 10px 2px; outline: none;
  transition: border-color 160ms;
}
.input::placeholder { color: var(--ink-3); }
.input:focus { border-bottom-color: var(--ink); }
```

### Chips / Pills

```css
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  font: 10px 'IBM Plex Mono';
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 999px;
  background: var(--paper-3); color: var(--ink-2);
}
.chip-green { background: var(--green-bg); color: var(--green-fg); }
.chip-amber { background: var(--amber-bg); color: var(--amber-fg); }
.chip-coral { background: var(--coral-bg); color: var(--coral-fg); }
```

### Avatars

```css
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font: 500 15px 'Fraunces'; flex-shrink: 0;
}
/* "Ring" variant — signals "submitted" / "voted" */
/* box-shadow: 0 0 0 2px var(--paper), 0 0 0 3.5px var(--green); */
```

Member colors (used for avatars throughout):

| Member | bg | fg |
|---|---|---|
| Sarah | `#FED7C7` | `#993C1D` |
| Marcus | `#C4E8DA` | `#0F6E56` |
| Ami | `#FFE8B3` | `#9A6410` |
| Jules | `#D4D1F0` | `#4A4290` |
| Theo | `#F5E0D8` | `#8A5A40` |

(Generate these deterministically from member name/id at runtime — don't hardcode.)

---

## Screens

Each screen is mobile-first, 390px wide.

### 1. Landing (`/`)

**Purpose:** First touch. Users either start a new trip or join with a code.

**Layout (top to bottom):**
- Nav: wordmark left (`wanderlust` + coral period), `SIGN IN` text link + `CREATE TRIP` ghost button right
- Hero section (40px top padding, 28px horiz):
  - Eyebrow: "GROUP TRIP PLANNER"
  - H1, 52px Fraunces: "Where should we all *meet?*" (meet italic, coral)
  - Body, max-width 310px: group planner explainer
  - **Primary CTA** coral: "Start a trip →" — full-width
  - Hairline divider with inline label "OR JOIN WITH CODE"
  - Input (mono, uppercased) + `JOIN →` text button
- Map band (180px tall, bottom of screen): dotted SVG with flight paths converging on a coral destination dot. Caption below: "LISBON · 3 TRAVELERS · 92% MATCH"

**Key UX change from original:** Original had two black primary buttons competing (Start / Join). Now only "Start a trip" is primary; join-with-code is demoted to a quiet input + text button.

**Variant exists:** `LandingBold` — dark ink background, editorial magazine-style with large stacked Fraunces headline and coral period accents. Use if the brand wants a bolder moment; default is the light version.

### 2. Trip Hub (`/trip/:code`)

**Purpose:** Central status view. Who's in, who's not, and one clear next action.

**Layout:**
- Nav: `← HOME` text link, wordmark center
- Trip header: black chip "TRIP · WNDR42", copy button, H1 36px Fraunces "Cousins' *reunion*", mono meta "CREATED APR 12 · 5 TRAVELERS"
- Hairline divider
- **Action card** (amber-bg, 12px radius, 18px padding): amber circle with ⏳ emoji, "Your turn!" headline + subcopy. Below: coral primary CTA "Add my preferences →".
- Hairline divider
- **The Party** section:
  - Eyebrow "THE PARTY" + mono count "2 OF 5 IN"
  - Progress pips row: one 3px bar per member, green if submitted else hairline
  - Member list: avatar (green ring if submitted), name, "YOU" tag if current user, "✓ in" or "· waiting" status. Not-submitted members get a "NUDGE 👋" text button.
  - Rotten-egg nudge card (paper-2 bg): "🥚 Jules & Theo — last ones in are rotten eggs!"
- Invite code footer (at bottom via `margin-top: auto`): eyebrow + large mono code "WNDR42" + COPY/EMAIL ghost buttons

**Key UX changes:**
- Progress pips = group state at a glance (was: reading 5 status badges)
- Action card is amber + has personality (was: borderline-invisible gray box)
- Rotten-egg nudge adds social pressure with humor
- Invite code demoted from visual centerpiece to footer utility

### 3. Sign In (`/signin`)

**Purpose:** Return-user auth.

**Layout:**
- Nav: wordmark only
- 48px top padding, content 28px horiz
- Eyebrow "WELCOME BACK", H1 40px "Sign *in.*"
- Body "Pick up where you left off."
- Email field (underline input), then password field with `FORGOT?` text button right-aligned on same row as the label
- Coral primary "Continue →" full-width
- OR divider
- "New here? Create account →" (the "Create account →" part is a coral inline text link in DM Sans, not mono)

### 4. Create Trip Modal (`/create`)

**Purpose:** Name a new trip.

**Layout:**
- Full paper-2 background
- Modal card (paper bg, 16px radius, 28x24 padding, soft shadow):
  - Eyebrow "NEW TRIP" + × close button
  - H2 30px "Name your *trip.*"
  - Body "Something memorable. You can change it later."
  - Input labeled "TRIP NAME", 18px
  - Eyebrow "OR PICK A VIBE" + 4 suggestion chips (Bach weekend 🥂, Family summer ☀️, Ski week ⛷️, Big 3-0 🎂) — these are DM Sans 11px, not mono, inside paper-2 chips
  - Coral primary "Create & invite →" full-width
  - Mono footnote "YOU'LL GET AN INVITE CODE NEXT"

### 5. Join (`/join/:code`)

**Purpose:** Landing for invitees.

**Layout:**
- Nav: `← BACK`, wordmark center
- Centered content, 48px vertical padding:
  - ✈️ emoji, 48px
  - Eyebrow "YOU'RE INVITED TO"
  - H1 40px "Cousins' *Reunion*"
  - Avatar stack of 4 members with +1 overflow chip
  - Body "Sarah, Marcus, Ami and 2 others are planning a trip."
  - Coral primary "Join the trip →"
  - `DECLINE` text button below

### 6. Preferences Flow — 5 steps

Shared top chrome on every step:
- Nav: `← BACK`, wordmark, mono "N/5" right
- **Segmented progress bar** below nav: N pips, 3px tall, coral if ≤current else hairline
- Eyebrow "STEP 01 · WHO" (zero-padded step num)

Shared bottom chrome:
- Paper bg bar, hairline top border
- Coral primary full-width "Continue →"

**Step 01 — Who:**
- H2 "Where are you *flying from?*"
- "YOUR CITY" label + input (default: Brooklyn, NY)
- "NEARBY AIRPORTS" — list of 3 airport cards (IATA code mono-bold + name + distance + checkbox right). Selected = paper-2 bg + ink border.
- Two-column stepper: "ADULTS" and "KIDS" with −/+ buttons (28×28, paper-2 bg, 6px radius) and big number center

**Step 02 — When:** (not mocked but follows the pattern: date range picker, quick duration chips "3 days / weekend / week / 2 weeks")

**Step 03 — Budget:** (This was the clunkiest original screen — redesign is critical)
- H2 "What's your *budget?*"
- Body "Per person, flights + accommodation. Food & activities are extra."
- **Big live number card** (paper-2, 16px radius, 24x20 padding):
  - Mono label "USD PER PERSON" + "CHANGE CURRENCY" text button
  - Huge Fraunces 42px: "$800 – $2,400"
  - Subtitle "~ comfortable midrange"
  - Dual-handle slider: hairline track, ink active range, two coral circle handles (16px, with paper border + soft shadow)
  - Min/max labels below
- Eyebrow "QUICK PICK" + 2×2 grid of vibe presets:
  - Backpack 🎒 $300–800
  - Midrange 🏨 $800–2.4k (default selected — ink border, paper-2 bg)
  - Comfort 🏝 $2.4–5k
  - Splurge 🥂 $5k+

**Step 04 — Interests:**
- H2 "What do you *love* doing?"
- Body "Pick at least 3. More is better — we'll match overlap across the group."
- **3-column grid** of activity cards (16px vertical padding, 12px radius): emoji 24px + label 12px. Selected = coral-bg + coral border + coral-fg text.
  - beach 🏖, food 🍝, culture 🏛, hiking 🥾, nightlife 🕺, shopping 🛍, nature 🌲, adventure 🪂, chill 📚
- "ACCOMMODATION" eyebrow + row of chip toggles (Hotel / Airbnb / Hostel / Resort). Selected = ink bg + paper text.

**Step 05 — Dates/review:** (follow the same pattern — summary + confirm)

### 7. Generating (loading state)

**Purpose:** AI is matching. Needs to feel purposeful, not just a spinner.

**Layout:**
- Nav: empty left, wordmark center, empty right
- Centered content:
  - 120×120 circle: dashed-border spinning ring (`animation: spinK 900ms linear infinite`) with 🧭 emoji in middle
  - Eyebrow in coral: "COUSINS' REUNION"
  - H2 32px: "Finding your *common ground*"
  - Below, left-aligned, max-width 280px: **step checklist**
    - ✓ Reading all 5 submissions
    - ✓ Mapping overlapping interests
    - ● Weighing flight paths & budgets (pulsing coral dot)
    - ○ Scoring destinations (gray circle)
  - Each step is mono 11px, letter-spacing 0.04em

Animations in CSS:
```css
@keyframes spinK { to { transform: rotate(360deg); } }
.spin { animation: spinK 900ms linear infinite; }
@keyframes pulseK { 0%,100%{opacity:.4} 50%{opacity:1} }
.pulse { animation: pulseK 1.4s ease-in-out infinite; }
```

### 8. Results (destination recommendations + voting)

**Purpose:** AI returns 3 destinations. Group votes.

**Layout:**
- Nav: `← TRIP`, wordmark center, `↻` refresh icon right
- Header: eyebrow "AI RECOMMENDATIONS · 3 MATCHES", H1 34px "Your *destinations*", subcopy "Everyone gets one vote. Tap a card to cast yours."
- Group tally: avatar stack (5 members, green ring on those who voted) + mono "4 OF 5 VOTED · WAITING ON THEO"
- **Destination cards** (stacked, 14px radius):
  - Your-voted card: paper-2 bg + coral 1.5px border
  - Leading card (rank 1): green banner strip on top "▲ LEADING · 3 VOTES"
  - Card body (16/18 padding):
    - Flag emoji + Fraunces 26px city name
    - Mono meta: "PORTUGAL · BEST MAY–OCT"
    - Right side: big match % (mono 22px bold green-fg) + "MATCH" label
    - Reason paragraph (13px, ink-2, 1.6 line-height)
    - Tag chips row (warm / foodie / walkable)
    - Vote bar: hairline top border, "N VOTE(S)" left with stacked voter avatars (20px, overlapping, white ring), vote button right:
      - If you voted: coral `.btn-primary` pill "✓ Your vote"
      - Else: ghost pill "Vote for this"
- Footer: dashed-border card "Not feeling any of these?" + "↻ GET 3 NEW OPTIONS" text button

### 9. Decided (booking prompt)

**Purpose:** Payoff moment. Group has locked in.

**Layout:**
- Full paper-2 background
- Nav: `← TRIP`, wordmark center
- **Hero banner** (20px inset, 16px radius, **dark ink background**, paper text):
  - Top strip: mono "✦ LOCKED IN" coral left, "DECIDED APR 20" dim right
  - 🇵🇹 flag 32px
  - HUGE Fraunces 52px "Lisbon"
  - Subtext "Portugal · arriving LIS"
  - Quote block (left-border coral 2px, padding-left 14): "Everyone's top 3. Food, beach, culture — the overlap is huge. Flights fit all 5 budgets."
- Flight list section (paper):
  - Eyebrow "FLIGHTS PER TRAVELER" + "↻ REFRESH"
  - One row per traveler (paper bg, hairline border, 10px radius):
    - Avatar, name + IATA→LIS mono subtext, DIRECT/1-STOP indicator (green dot if direct)
    - Right: mono price (14px bold) + coral "BOOK →" text button

---

## Interactions & Behavior

### Primary CTA discipline
Every screen has **one and only one** coral `.btn-primary` pill. If you find yourself wanting a second, make it ghost.

### Transitions
- Button hover: `transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.15); transition: 160ms;`
- Ghost button hover: inverts (ink bg, paper text)
- Input focus: border-bottom color darkens from `--ink-4` to `--ink`
- Selection state on cards (airport picker, interest grid, budget presets): instant, no animation — border and bg swap

### State management expectations

- **Trip state:** `{ code, name, members: [{id, name, submitted, voted, origin}], status: 'collecting'|'generating'|'voting'|'decided', destination }`
- **Preferences state** (per member): `{ origin: {city, airports[]}, partySize: {adults, kids}, dates, budget: {min, max, preset}, interests: [], accommodation: [] }`
- **Voting:** one vote per member, `destination.votes: [memberId]`. Show live progress.
- **Nudge:** sends a push/email notification to the target member; button should disable for 60s after click.

### Routes suggested (map to the repo's router)
- `/` — Landing
- `/signin` — Auth
- `/create` — Create trip modal (can be a modal over `/` or its own route)
- `/join/:code` — Invited-via-code landing
- `/trip/:code` — Trip hub
- `/trip/:code/prefs/:step` — Preferences flow (1–5)
- `/trip/:code/generating` — Loading
- `/trip/:code/results` — Results + voting
- `/trip/:code/decided` — Locked-in screen

---

## Implementation Order (suggested)

1. **Tokens + typography** — port `styles.css` (`:root` block, button/input/chip classes). Get Google Fonts loading. Verify with one test screen.
2. **Trip Hub** — highest-value single screen, touches most shared components (avatars, chips, progress pips, dividers).
3. **Preferences flow** — most screens but all share the same chrome (`PrefsHeader` + `PrefsFooter`). Build those two components first.
4. **Landing + Sign in + Create + Join** — share hero/headline pattern.
5. **Results + Decided** — biggest visual departure (dark banner, card-with-banner); save for last when the system is solid.
6. **Generating** — simple but uses animations; polish pass at the end.

---

## Files in this handoff

- `README.md` — this document
- `styles.css` — production-ready tokens + utility classes
- `screens-landing.jsx` — landing + editorial variant
- `screens-trip.jsx` — auth, trip hub, create modal, join
- `screens-prefs.jsx` — preferences flow
- `screens-results.jsx` — generating, results + voting, decided

All JSX files are design references — the styling and layout are authoritative; the React mechanics (no real state, hardcoded data) are not. Recreate them as proper connected components in the target codebase.

The full interactive design canvas is at `UX Cleanup.html` in the original project — open it to see all screens in context with before/after pairs.
