# Session Notes — Wanderlust

---

## ⚡ READ THIS FIRST — Active Roadmap

Work through phases in order. Do not skip ahead. Start each session by reading this section and confirming which item is next.

### Phase 0 — Housekeeping (do before anything else)
- [x] Confirm AI results flow works end-to-end (2 members, submitted prefs, edge function returns destinations)
- [x] Handle "already a member" gracefully on join flow (currently throws an error)
- [x] Fix AirportPicker subtitle: shows raw ISO country code (e.g. "US") — should show city/region name

### Phase 1 — Soft Brutalist Design System Refactor
Full frontend redesign. Replace the current "Cartographer's Dream" (dark navy + gold) with a cohesive Soft Brutalist system across every page and component. See design notes below.
- [x] Define design tokens (colors, type scale, spacing, border/shadow system) in `src/index.css`
- [x] Refactor LandingPage
- [x] Refactor AuthPage
- [x] Refactor TripPage (dashboard)
- [x] Refactor PreferencesPage (all 5 steps + AirportPicker)
- [x] Refactor JoinPage
- [x] Refactor ResultsPage (cards, generating screen, tally)
- [x] Refactor shared nav / layout chrome
- [x] Fix App.tsx LoadingScreen (was still dark navy + gold "charting your course")
- [x] Fix FlightPathMap: corrected city positions (equirectangular), better continent paths, neutral ink colors, swapped London → Mumbai for visual spread

**Implementation notes:**
- Fonts: Space Grotesk (display/headings, 700), DM Sans (body), Space Mono (labels/codes)
- Palette: bg `#F4EFE6`, surface `#EAE6DC`, ink `#1A1007`, accent `#D4522A` (brick/terracotta)
- Border system: 2px solid var(--color-ink), no radius; offset box-shadow 3-6px 0 var(--color-ink)
- Utility classes in index.css: `.brut-btn-primary`, `.brut-btn-ghost`, `.brut-card`, `.brut-label`, `.brut-input`
- FlightPathMap adapted for light bg (ink-colored outlines, accent flight paths)
- AuthPage: tab-style mode switcher replacing subtitle text

**Soft Brutalist design notes:**
- Raw, structural aesthetic — visible borders, stark typographic hierarchy, minimal decoration
- Softer than classic brutalism: off-whites/creams, muted earth tones, occasional bold accent
- Chunky sans-serif headers (e.g. Space Grotesk, DM Sans, or similar), monospace for labels/codes
- Thick borders (2–3px solid), flat cards with offset box-shadows (no blur), no rounded corners or very slight rounding
- Color palette: warm off-white background (#F5F0E8 or similar), near-black text, one bold accent (coral, clay, or mustard), muted secondary surfaces
- Buttons: heavy border, flat fill, bold label, offset shadow on hover
- Forms: visible fieldset borders, large labels above inputs, no floating labels
- No gradients. No frosted glass. No soft drop shadows.

### Phase 2 — Results UX Overhaul
- [x] Increase destination output: edge function returns 5 destinations (not 2–3), ranked by match score
- [x] "None of these" button: available to all members (not just creator), triggers a new run
- [x] Improve destination cards: vibe_tags chips, best_months, flight_note meta row, AI reasoning — all from Claude
- [x] Persist prior suggestion sets — run_number column added; re-runs append rather than delete; "RUN 1 / RUN 2" tabs in UI
- [x] Apply migration 004_destinations_phase2.sql — applied 2026-04-13 via Supabase MCP
- [x] **"Try Again" deduplication** — edge function queries all existing city names for the trip and injects an exclusion list into the Claude prompt; deployed as v5 (2026-04-14)

### Phase 3 — Post-Vote Flow
Triggered once a destination reaches majority vote (or the creator marks it as decided).

- [x] "It's decided!" state on ResultsPage — majority prompt (creator only), lock-in mutation, decided banner; migration 005 applied (2026-04-14)
- [ ] **Flight search per member** (Amadeus API)
  - Each member already has `origin_airports` saved in preferences
  - Edge function: for each member's origin airports → Amadeus flight-offers search → return cheapest option per origin
  - ResultsPage Phase 2: show a flight card per member with price, airline, outbound + return dates
  - Members can mark their flight as "booked" (stored in DB)
- [ ] **Hotel search**
  - Amadeus hotel search for the winning destination
  - Show 3–5 options with name, stars, nightly rate, link to booking
  - Group can "like" options (lightweight reaction, not a full vote)
- [ ] **Local activities**
  - AI-generated activity suggestions based on group's submitted interests (from preferences)
  - Each suggestion links to an external website (TripAdvisor, Viator, official venue site, etc.)
  - Organized by category matching submitted interest tags (e.g. hiking → trail operators, food → restaurant/tour sites)
  - "Things to do" card grid on the results page below hotels

### Phase 5 — Community & Trip Intelligence (Long-Term Vision)
- **Trip reviews**: after a trip is completed, members can leave a review of the destination — overall rating, pros/cons, what worked for the group
- **Destination database**: aggregate reviews across all trips into a searchable, community-rated destination index (city, vibe, group type, season, budget range)
- **Trip type categorisation**: based on user inputs (group composition, interests, budget), auto-classify trips into buckets — e.g. Bachelor/Bachelorette, Family Reunion, Friend Group Getaway, Couples Trip — and surface them in destination suggestions
- **Curated trip templates**: surface highly-rated past trips as starting points ("Groups like yours loved Lisbon in June — here's what they did")
- **Personalisation over time**: as a user plans more trips, their profile builds up — Claude can reference past trips, known preferences, and group dynamics when suggesting future destinations
- **Bachelor/Bachelorette focus**: dedicated flow for party-type trips — different vibe tags, activity types (nightlife, spa, adventure), and a curated database of destinations that score highly for those use cases

### Phase 4 — Polish & Growth
- [ ] Push / email notifications when all members have submitted prefs (so creator knows to run AI)
- [ ] Trip status emails (invite → submitted → results ready)
- [ ] Mobile-responsive audit across all pages
- [ ] Plaid or email-based refund tracking for booked expenses (stretch)

---

## What This Project Does
Collaborative trip planner for groups of friends/family spread across the world. Each traveler submits their origin city, travel dates, budget, party size, and activity preferences. AI (Claude) analyzes all submissions and surfaces destination recommendations with match scores and reasoning. The group votes, then gets real flight options per member, hotel picks, and activity links — all in one place.

---

## Current Status (as of 2026-04-13)

**Working:**
- Full auth flow (Supabase email/password, callback handling)
- Landing page: hero, FlightPathMap SVG animation, "Start a Trip" CTA, join-by-code form, My Trips list
- Create trip modal → DB insert → navigate to /trip/:id
- Trip dashboard: member list, invite code copy, email invite, progress bar, Find Destinations CTA
- 5-step preferences form — all wired to Supabase
- AirportPicker: Nominatim geocoding → haversine → multi-select IATA codes
- Join flow: display name prompt, sessionStorage handoff for unauthenticated users
- AI results page: Phase 2 cards (vibe tags, best months, flight note), run history tabs, voting + live tally, "None of these" re-run for all members
- `find-destinations` edge function: v4, deployed with `verify_jwt: false` (ES256 fix — see Key Decisions)
- ResultsPage uses raw `fetch` (not `supabase.functions.invoke`) with explicit refreshed token

**Known Issues / Next Up (start here next session):**
1. ~~"Try Again" deduplication~~ — fixed (edge fn v5, 2026-04-14)
2. ~~JoinPage already-a-member~~ — confirmed working (2026-04-14)
3. ~~AirportPicker country subtitle~~ — confirmed working (2026-04-14)
4. **Phase 3** — Post-vote flow: "It's decided!" state → flights (Amadeus) → hotels → activities

---

## Key Decisions
- **Stack:** React 18 + TypeScript + Vite 7 (SWC), Tailwind 4 via @tailwindcss/vite, Supabase, TanStack Query 5, React Router 6, Sonner toasts
- **Design:** Currently "Cartographer's Dream" — will be replaced by Soft Brutalist system in Phase 1
- **Airport data:** Static `airports` npm package, large/medium only, haversine distance, Nominatim geocoding (no API key)
- **Auth:** Full Supabase email/password, no anonymous flows
- **AI:** Claude `claude-haiku-4-5-20251001` via Anthropic SDK in Deno edge function
- **Edge function auth:** `verify_jwt: false` on `find-destinations` — Supabase runtime rejects ES256 (asymmetric) JWTs, which new projects issue by default. Auth is handled manually via `is_trip_member` RPC. `supabase.functions.invoke` was also abandoned in favour of raw `fetch` because it re-calls `getSession()` internally and can send a stale cached token even after `refreshSession()`.
- **Vote pattern:** Upsert with `onConflict: 'trip_id,user_id'` — atomic, no delete+insert race
- **Supabase types:** Added Relationships/Enums/CompositeTypes to satisfy supabase-js v2.99 overload resolution

## Supabase Project
- URL: https://agbrfodytojzcyvnooec.supabase.co
- Local dev: port 5173; redirect URL = http://localhost:5174/auth/callback (may need updating)
- Migrations applied: 001–004
- GitHub: https://github.com/pjcooley7-ship-it/family-adventure-planner

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
- Built useDestinations + useTripVotes + useToggleVote hooks
- Fixed vote race condition: upsert replaces delete+insert
- Fixed RLS blocking non-member trip lookup: migration 003_trips_open_select.sql
- Fixed edge function 401: disabled JWT verification in Supabase dashboard
- Fixed React Query cache not updating after edge function: explicit invalidateQueries call
- Auth defaults to sign-in tab; My Trips section added to LandingPage
- Email invite (mailto:) added to TripPage
- Simplify review: moved countryCodeToFlag to utils.ts, moved @keyframes spin to index.css, moved GENERATING_PHRASES to module-level constant, fixed O(N·V) vote counting with Map
- **Roadmap written and committed to SESSION_NOTES.md**

### 2026-04-01 — Session 3
- Phase 0 complete: already-a-member join flow fixed (SELECT-then-INSERT pattern in useJoinTrip, routes to /trip/:id for existing members vs /preferences for new); AirportPicker country label fixed with Intl.DisplayNames
- Phase 1 complete: full Soft Brutalist redesign across all pages and components
  - New fonts: DM Sans (display + body), Space Mono (labels/codes) via Google Fonts
  - New palette: warm off-white bg (#FFFDF7), surface (#F5F2EB), neutral ink (#1a1a1a), accent (#D4522A)
  - Design tokens in src/index.css via @theme {}; utility classes: .brut-btn-primary/ghost, .brut-card, .brut-label, .badge-positive/warning/negative/neutral
  - DocContainer layout: max-width 720px, document-on-surface, 2.5px borders
  - All pages refactored: LandingPage, AuthPage, TripPage, PreferencesPage, JoinPage, ResultsPage
  - All components refactored: FormField, StepIndicator, AirportPicker, CreateTripModal
  - App.tsx LoadingScreen updated: was dark navy + gold, now ink spinner on warm surface
  - FlightPathMap rebuilt: correct equirectangular city positions (NYC, Buenos Aires, Nairobi, Mumbai, Tokyo, Sydney), bezier continent paths, neutral ink fills
  - Build passing, TypeScript clean

### 2026-04-13 — Session 5
- Applied migration 004 via Supabase MCP (run_number, vibe_tags, best_months, flight_note on destinations)
- Deployed find-destinations edge function v4 with verify_jwt: false (ES256 JWT fix)
- Smoke-tested Phase 2 results: 5 cards with vibe tags, best months, flight note all rendering correctly; run history tabs working
- Diagnosed and fixed edge function 401: new Supabase projects issue ES256 JWTs which the runtime's verify_jwt can't handle; switched to verify_jwt: false + manual auth
- Fixed ResultsPage fetch: replaced supabase.functions.invoke with raw fetch + explicit refreshed token
- Identified "Try Again" deduplication bug: re-runs can repeat cities — not yet fixed

### 2026-04-14 — Session 6
- Verified Phase 0 items (JoinPage already-a-member, AirportPicker country name) — both confirmed working, no regression
- Fixed "Try Again" deduplication: edge function now queries all existing destination cities for the trip and injects them as an exclusion list in the Claude prompt — deployed as find-destinations v5
- Phase 2 roadmap fully complete

### 2026-04-14 — Session 6 (continued)
- Implemented "It's decided!" state (Phase 3 step 1):
  - Migration 005: added `decided_destination_id uuid` to `trips`, expanded status check constraint to include 'decided'
  - `useLockDestination` mutation in `useTripMutations.ts`: sets status='decided' + decided_destination_id
  - ResultsPage: majority detection (>50% of members voted for same dest on latest run), creator-only "LOCK IT IN" banner, decided full-screen view with accent-colored winner card, non-winner cards dimmed, voting disabled when decided

### 2026-04-14 — Session 7
- Fixed all 3 destination card UI bugs — same root cause: `countryCodeToFlag()` hex constant was `0x1F1E0` instead of `0x1F1E6` (off by 6). PT→JN boxes, GR→Albanian flag, ES/FR→vertical line glyphs. One-character fix + null guard.
- Migration 006: added `destination_iata text` to `destinations`
- Updated `find-destinations` v6 prompt: Claude now returns `destination_iata` (nearest major airport) + tightened `country_code` instructions with island/territory examples
- Migration 007: created `flight_results` table with RLS (members can select, service role manages)
- Built `search-flights` edge function v1: verifies membership, checks trip is decided, 6hr cache, calls SerpAPI `engine=google_flights` per member using their first origin airport + submitted dates, upserts results
- Built `useFlightResults` + `useSearchFlights` hooks in `src/hooks/useFlights.ts`
- Updated decided screen in ResultsPage: flights section with SEARCH FLIGHTS / REFRESH button, FlightCard per member (price, airline logo, duration, stops, error states), cache timestamp
- `SERP_API_KEY` added to Supabase edge function secrets
- Added Phase 5 long-term vision to plan: community reviews, destination database, trip type classification (Bachelor/Bachelorette etc.), curated templates

### Next session — start here

**1. Test flight search (not yet tested — do this first)**
Pre-condition: need a decided trip whose decided destination has a `destination_iata`. Two ways to get one:
- Run a new AI search on a test trip (find-destinations v6 now returns `destination_iata`) → lock in a result
- Or patch an existing decided destination manually in Supabase SQL editor:
  ```sql
  update destinations set destination_iata = 'LIS'
  where id = '<your decided_destination_id>';
  ```

Test steps:
1. Go to `/trip/:id/results` for a decided trip — confirm winner banner shows
2. Click **SEARCH FLIGHTS** — button shows "SEARCHING…"
3. Expect a FlightCard per member: price, airline logo, duration, stops (green = direct)
4. Members missing dates → "No travel dates set — update preferences to see flights"
5. Click **REFRESH** within 6 hours → should return cached result instantly (no SerpAPI call)
6. Check Supabase `flight_results` table to confirm upserted rows
7. If 400 error: check edge function logs → Supabase dashboard → Edge Functions → search-flights → Logs

**2. Phase 3 remaining**
- [ ] **Hotel search** — SerpAPI `engine=google_hotels`, search for decided destination city, show 3–5 options with name, stars, price/night; add below flights on decided screen
- [ ] **Activity suggestions** — Claude prompt using group's submitted interest tags, return 6–8 activities with name, category, and external link; add below hotels on decided screen

**3. Phase 4 — Polish & Growth** (after Phase 3 complete)
- Push/email notifications when all members submitted prefs
- Mobile-responsive audit
- Trip status emails
