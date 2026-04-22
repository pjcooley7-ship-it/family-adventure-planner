# Session Notes — Wanderlust

---

## ⚡ READ THIS FIRST — Active Roadmap

Work through phases in order. Do not skip ahead. Start each session by reading this section and confirming which item is next.

### Phase 0 — Housekeeping (do before anything else)
- [x] Confirm AI results flow works end-to-end (2 members, submitted prefs, edge function returns destinations)
- [x] Handle "already a member" gracefully on join flow (currently throws an error)
- [x] Fix AirportPicker subtitle: shows raw ISO country code (e.g. "US") — should show city/region name

### Phase 1 — Soft Brutalist Design System Refactor
- [x] Define design tokens in `src/index.css`
- [x] Refactor all pages and components
- [x] Fix FlightPathMap geography + color

### Phase 2 — Results UX Overhaul
- [x] 5 destination cards per run, ranked by match score
- [x] "None of these" re-run for all members
- [x] vibe_tags, best_months, flight_note, AI reasoning on cards
- [x] run_number history tabs
- [x] "Try Again" deduplication (exclude prior cities from Claude prompt)

### Phase 3 — Post-Vote Flow
- [x] "It's decided!" state — majority prompt, lock-in mutation, decided banner
- [x] Flight search per member — SerpAPI Google Flights, FlightCard UI, 6hr cache
- [x] BOOK button on each FlightCard → Kayak pre-filled with origin/dest/dates
- [x] Hotel search — SerpAPI `engine=google_hotels`, 3–5 options below flights
- [x] Activity suggestions — Claude prompt from group's interest tags, 6–8 activities with external links

### Phase 4 — Polish & Growth
- [ ] **Email notifications** — Resend.com, DB trigger fires `send-notification` edge function when all members submit prefs
- [ ] **Trip status emails** — invite, "all prefs in", "destination decided"
- [ ] Activities API integration (GetYourGuide or Viator) — replace AI-generated links with real bookable inventory

### Phase 5 — UX Cleanup Redesign ✅ COMPLETE (merged to main 2026-04-22)
Design handoff is in `design_handoff_ux_cleanup/`. All screens implemented:
- [x] Tokens + typography (`src/index.css`)
- [x] Trip Hub (`/trip/:id`) — `TripPage.tsx`
- [x] Preferences flow — sticky header + coral progress + 5 steps (`screens-prefs.jsx`)
- [x] Landing + Sign In + Create modal + Join (`screens-landing.jsx`, `screens-trip.jsx`)
- [x] Results + Decided (`screens-results.jsx`)
- [x] Generating loading screen (`screens-results.jsx`)

### Phase 6 — Community & Trip Intelligence (Long-Term Vision)
- Trip reviews + destination database
- Trip type categorisation (Bachelor/Bachelorette, Family, Friend Group, etc.)
- Curated trip templates from past trips
- Personalisation over time (Claude references past trips + preferences)

---

## What This Project Does
Collaborative trip planner for groups spread across the world. Each traveler submits origin city, travel dates, budget, party size, and activity preferences. AI (Claude) surfaces destination recommendations with match scores. The group votes, then gets real flight options per member, hotel picks, and activity links — all in one place.

---

## Current Status (as of 2026-04-22)

**Branch:** `main` — Phase 5 UX Cleanup Redesign complete and merged

**Working end-to-end on main:**
- Full auth flow (Supabase email/password, callback handling)
- Landing page: hero, FlightPathMap, create/join CTAs, My Trips list
- Trip dashboard, 5-step preferences form, join flow (already-a-member detection)
- AI results: Phase 2 cards, run history tabs, voting, "None of these" re-run
- "It's decided!" flow: majority detection, creator lock-in, winner banner
- Flight search (SerpAPI, all airports parallel, cheapest), FlightCard, BOOK → Kayak
- Hotel search (SerpAPI), activity suggestions (Claude haiku + Google Maps URLs)
- Mobile-responsive: `--section-px`, DocContainer mobile borders
- **Full paper+serif redesign on all screens**: Fraunces display, IBM Plex Mono, warm palette, pill buttons, hairline dividers, coral CTAs

**Pending deploy (on main):**
- `search-flights` v2 needs: `brew install supabase/tap/supabase` → `supabase login` → `supabase functions deploy search-flights --project-ref agbrfodytojzcyvnooec`

**Known issues:**
- PreferencesPage not yet mobile-audited (low priority)

---

## Key Decisions
- **Stack:** React 18 + TypeScript + Vite 7 (SWC), Tailwind 4 via @tailwindcss/vite, Supabase, TanStack Query 5, React Router 6, Sonner toasts
- **Original design:** Soft Brutalist — DM Sans + Space Mono, 2.5px solid borders, flat offset shadows, zero border-radius, DocContainer 720px. Preserved on `archive/original-design` branch + git tag `v0-original-design`.
- **New design (redesign/ux-cleanup):** Paper + serif DNA, Fraunces display, IBM Plex Mono labels, hairline dividers (not thick borders), pill buttons, rounded cards, one coral CTA per screen. See `design_handoff_ux_cleanup/README.md` for full spec.
- **Incremental migration strategy:** New utility classes added alongside `.brut-*` — replace screen by screen, don't do a global find-replace. `.brut-*` classes can be deleted after all screens are migrated.
- **Avatar colors:** Deterministic hash from member name → fixed palette of 8 pairs. Never hardcode per-member.
- **Airport data:** Static `airports` npm package, large/medium only, haversine distance, Nominatim geocoding (no API key)
- **Auth:** Full Supabase email/password, no anonymous flows
- **AI:** Claude `claude-haiku-4-5-20251001` via Anthropic SDK in Deno edge function
- **Flight search:** SerpAPI `engine=google_flights`, `SERP_API_KEY` as Supabase edge function secret; all airports parallel via `Promise.allSettled`, picks cheapest
- **Booking links:** Kayak deep-link `kayak.com/flights/{FROM}-{TO}/{DEPART}/{RETURN}`
- **Edge function auth:** `verify_jwt: false` — Supabase runtime rejects ES256 JWTs. Auth handled manually via `is_trip_member` RPC
- **Email:** Resend.com chosen for trip status emails — needs `RESEND_API_KEY` as Supabase secret
- **Supabase types:** `src/integrations/supabase/types.ts` fully auto-generated

## Supabase Project
- URL: https://agbrfodytojzcyvnooec.supabase.co
- Local dev: port 5173 (Vite default — no custom port configured); redirect URL = http://localhost:5174/auth/callback (update if testing auth locally)
- Migrations applied: 001–009
- GitHub: https://github.com/pjcooley7-ship-it/family-adventure-planner
- Lovable: https://global-family-adventures.lovable.app/

---

## Todo

### Redesign (redesign/ux-cleanup branch) — do these first
- [x] **Preferences flow** — sticky header + coral progress + 5 steps rebuilt. Reference: `design_handoff_ux_cleanup/screens-prefs.jsx`
- [x] **Landing page** — eyebrow + display headline, coral CTA, join code demoted, FlightPathMap band, trip rows as rounded cards
- [x] **Auth page** — underline inputs, eyebrow + display headline, coral Continue →, inline mode switch
- [x] **Create trip modal** — rounded shadow card, suggestion chips, underline inputs, coral CTA
- [x] **Join page** — centered, avatar stack, eyebrow + display headline, underline name input, coral "Join the trip →"
- [x] **Results page** — destination cards with coral vote button, leading banner, footer re-run option. Reference: `design_handoff_ux_cleanup/screens-results.jsx`
- [x] **Decided screen** — dark ink hero banner, flight list per traveler with BOOK links. Reference: `screens-results.jsx`
- [x] **Generating screen** — compass spinner, step checklist with pulse dot. Reference: `screens-results.jsx`
- [x] Once all screens migrated: delete all `.brut-*` classes from `src/index.css`
- [x] Merge `redesign/ux-cleanup` → `main` and push

### Phase 4 (on main, after redesign merged)
- [ ] Deploy `search-flights` v2: `brew install supabase/tap/supabase` → `supabase login` → `supabase functions deploy search-flights --project-ref agbrfodytojzcyvnooec`
- [ ] **Email notifications** — Resend.com, `RESEND_API_KEY` secret, `send-notification` edge function, DB trigger when all members submit prefs
- [ ] **Trip status emails** — invite, "all prefs in", "destination decided"
- [ ] Activities API (GetYourGuide or Viator) — replace Claude-generated links with real bookable inventory
- [ ] PreferencesPage mobile audit (low priority)

---

## Session Log

### 2026-03-16 — Session 1
- Built AirportPicker (Nominatim geocoding, haversine, multi-select IATA)
- Built airportUtils.ts, updated TravelPreferences + Supabase types for origin_airports
- Built JoinPage, updated AuthCallbackPage + LandingPage for unauthenticated join flow
- Migration 002_origin_airports.sql

### 2026-03-31 — Session 2
- Built find-destinations Supabase edge function (Claude haiku, inserts destinations)
- Built ResultsPage: animated generating screen, destination cards, voting UI, live tally
- Fixed vote race condition (upsert), RLS on trips, edge function 401, React Query cache
- Auth defaults to sign-in; My Trips added to LandingPage; email invite on TripPage

### 2026-04-01 — Session 3
- Phase 0 complete: already-a-member join flow, AirportPicker country label
- Phase 1 complete: full Soft Brutalist redesign across all pages and components
  - New fonts (DM Sans + Space Mono), new palette, design tokens in @theme {}, utility classes
  - DocContainer layout, FlightPathMap rebuilt with correct equirectangular geography

### 2026-04-13 — Session 5
- Phase 2 complete: migration 004, find-destinations v4 (verify_jwt: false, ES256 fix)
- Smoke-tested Phase 2 results; identified "Try Again" deduplication bug

### 2026-04-14 — Session 6
- Fixed "Try Again" deduplication — edge function excludes prior cities (find-destinations v5)
- Phase 3 step 1: "It's decided!" state — migration 005, useLockDestination, decided banner
- Country flag bug fixed (0x1F1E0 → 0x1F1E6)
- Migration 006: destination_iata on destinations
- find-destinations v6: Claude now returns destination_iata (nearest major airport)

### 2026-04-14 — Session 7
- Migration 007: flight_results table with RLS
- Built search-flights edge function v1 (SerpAPI google_flights, 6hr cache, per-member)
- Built useFlightResults + useSearchFlights hooks
- Updated decided screen: flights section, FlightCard per member, SEARCH FLIGHTS / REFRESH button

### 2026-04-16 — Session 8
- Lovable sync: committed and pushed all Phase 2/3 work; fixed wrong .env committed by Lovable
- Supabase types regenerated: replaced hand-crafted types.ts with fully auto-generated schema
- useMyTrips race condition fixed: added `enabled: !!userId`
- Flight search tested and working; BOOK button (Kayak deep-link) added

### 2026-04-17 — Session 9
- Phase 3 complete: Hotel search + activity suggestions
- Migration 008: `hotel_results` table; search-hotels v1 edge function; useHotels.ts
- suggest-activities v1 edge function; useActivities.ts hook
- ResultsPage decided screen: hotels + activities sections added

### 2026-04-17 — Session 10
- Smoke-tested Phase 3: hotels and activities confirmed working against Lisbon trip
- Hotel card polish: migration 009 (property_type, hotel_class); search-hotels v2
- Activity link fix: suggest-activities v2 uses Google Maps search URLs (no hallucinated links)
- Mobile-responsive audit: --section-px, DocContainer, section headers, FlightCard, majority prompt

### 2026-04-21 — Session 11
- Loose ends: search-flights v2 (all airports parallel), date-overlap warning banner, deleted dead stubs
- Supabase CLI not installed — user needs `brew install supabase/tap/supabase` before deploying

### Snapshot: v3-pre-ux-cleanup (2026-04-21)
- Screenshots: ~/ui-snapshots/wanderlust/2026-04-21-v3-pre-ux-cleanup/
- Git tag: ui-2026-04-21-v3-pre-ux-cleanup
- Routes: landing, auth, join

### 2026-04-21 — Session 12 (UX Cleanup Redesign)
- Received design handoff package in `design_handoff_ux_cleanup/` (README, styles.css, 4 screen reference JSX files)
- Committed Phase 3 loose ends as pre-redesign baseline; tagged `v0-original-design`; created `archive/original-design` branch (for blog before/after screenshots); created `redesign/ux-cleanup` working branch
- Snapshot taken: `v3-pre-ux-cleanup` (landing, auth, join) — stored at `~/ui-snapshots/wanderlust/2026-04-21-v3-pre-ux-cleanup/`
- Ported design tokens to `src/index.css`: Fraunces + IBM Plex Mono added to Google Fonts import; `@theme {}` colors updated to warmer palette; full `:root` shorthand token block (`--paper`, `--ink`, `--hairline`, `--f-display`, `--s-1`…`--s-10`, etc.); new utility classes (`.btn-primary`, `.btn-primary.coral`, `.btn-ghost`, `.btn-text`, `.input-underline`, `.chip-new`, `.avatar`, `.rule`, `.eyebrow`, `.display`, `.mono`, `.spin`, `.pulse`); `.brut-*` classes preserved for backward compat
- Rebuilt `TripPage.tsx` to new design spec: serif Fraunces headline (italic coral last word), amber "Your turn!" / green "You're in!" / green "Everyone's in!" action cards, progress pips, colored avatars with green ring, nudge buttons (60s cooldown), rotten-egg card, invite code footer with COPY + EMAIL ghost buttons
- TypeScript clean (`tsc --noEmit` passes)
- **Next:** Start Preferences flow — build `PrefsHeader` + `PrefsFooter` shared components first, then rebuild all 5 steps using `design_handoff_ux_cleanup/screens-prefs.jsx` as reference

### 2026-04-22 — Session 13 (Preferences + AirportPicker redesign)
- Rebuilt `PreferencesPage.tsx` to new design: sticky header (← BACK | Wordmark | step counter), segmented coral progress bar, eyebrow step label, Fraunces display headline (italic coral last word), sticky coral Continue → footer
- All 5 steps rebuilt with new tokens: Stepper component (rounded, paper-2 bg), Toggle component (pill, coral active), rounded date inputs, budget preset tiles (Backpack/Midrange/Comfort/Splurge) with live range display + visual bar, activity grid (coral-bg selected), accommodation pills (ink fill selected), notes textarea + summary table
- Updated `AirportPicker.tsx`: rounded hairline-border rows, checkbox on right, distance + country in subtitle, pill selected-chip, new CSS vars throughout
- TypeScript clean (`tsc --noEmit` passes)
- Snapshot: `v5-prefs-redesign` (landing, auth, join) — ~/ui-snapshots/wanderlust/2026-04-22-v5-prefs-redesign/
- **Next:** Landing page redesign — reference: `design_handoff_ux_cleanup/screens-landing.jsx`

### 2026-04-22 — Session 14 (Results + Decided + Generating redesign; merge to main)
- Rebuilt `ResultsPage.tsx` to new design — three states in one file:
  - Generating: 100px dashed spinning compass circle, step checklist with pulse dot
  - Results: eyebrow + display headline, avatar tally, run-history pill tabs, DestinationCard (rounded, green leading banner, chip-new vibe tags, coral vote button), majority detection green banner
  - Decided: dark ink hero banner (✦ LOCKED IN), 52px city name, coral-left-border AI reasoning, per-traveler flights/hotels/activities as rounded cards, amber date-overlap warning
- Deleted all `.brut-*` classes and `.badge-*` classes from `src/index.css` (none were referenced)
- Snapshot: `v7-results-redesign` (landing, auth, join) — ~/ui-snapshots/wanderlust/2026-04-22-v7-results-redesign/
- Committed all redesign work; merged `redesign/ux-cleanup` → `main`; pushed to GitHub
- **Phase 5 (UX Cleanup Redesign) complete**
- **Next:** Phase 4 — deploy `search-flights` v2, email notifications (Resend.com)
