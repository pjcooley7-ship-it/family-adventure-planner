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

### Phase 5 — Community & Trip Intelligence (Long-Term Vision)
- Trip reviews + destination database
- Trip type categorisation (Bachelor/Bachelorette, Family, Friend Group, etc.)
- Curated trip templates from past trips
- Personalisation over time (Claude references past trips + preferences)

---

## What This Project Does
Collaborative trip planner for groups spread across the world. Each traveler submits origin city, travel dates, budget, party size, and activity preferences. AI (Claude) surfaces destination recommendations with match scores. The group votes, then gets real flight options per member, hotel picks, and activity links — all in one place.

---

## Current Status (as of 2026-04-21)

**Working end-to-end:**
- Full auth flow (Supabase email/password, callback handling)
- Landing page: hero, FlightPathMap, create/join CTAs, My Trips list (gated on auth to fix race condition)
- Create trip → DB insert → navigate to /trip/:id
- Trip dashboard: member list, invite code, email invite, progress bar, Find Destinations CTA
- 5-step preferences form — all wired to Supabase + AirportPicker
- Join flow: already-a-member detection, sessionStorage handoff for unauthenticated users
- AI results: Phase 2 cards (vibe tags, best months, flight note, match score), run history tabs, voting, live tally, "None of these" re-run with deduplication
- "It's decided!" flow: majority detection, creator lock-in, winner banner, dimmed non-winners
- Flight search: SerpAPI per member, tries **all** member airports (parallel), returns cheapest across all; FlightCard (price, airline logo, duration, stops, error states), 6hr cache, REFRESH button, BOOK → Kayak deep-link
- Date-overlap warning banner on decided screen when members' travel windows don't overlap
- Hotel search: SerpAPI google_hotels, property type pill, star rating, Google rating, VIEW with Google Maps fallback
- Activity suggestions: Claude haiku, Google Maps search URLs (no hallucinated links), FIND ON MAPS button
- Mobile-responsive: all pages audited, `--section-px` responsive, DocContainer side borders hidden on mobile

**Pending deploy:**
- `search-flights` edge function updated (multi-airport support) — needs `supabase functions deploy` to go live. Install Supabase CLI first: `brew install supabase/tap/supabase`

**Known issues:**
- PreferencesPage not yet mobile-audited (low priority — form is mostly single-column)

---

## Key Decisions
- **Stack:** React 18 + TypeScript + Vite 7 (SWC), Tailwind 4 via @tailwindcss/vite, Supabase, TanStack Query 5, React Router 6, Sonner toasts
- **Design:** Soft Brutalist — DM Sans (display + body), Space Mono (labels/codes), warm paper palette (#FFFDF7 bg, #F5F2EB surface, #1a1a1a ink, #D4522A accent), 2.5px solid borders, flat offset box-shadows, zero border-radius, DocContainer 720px layout
- **Airport data:** Static `airports` npm package, large/medium only, haversine distance, Nominatim geocoding (no API key)
- **Auth:** Full Supabase email/password, no anonymous flows
- **AI:** Claude `claude-haiku-4-5-20251001` via Anthropic SDK in Deno edge function
- **Flight search:** SerpAPI `engine=google_flights` — `SERP_API_KEY` set as Supabase edge function secret; now tries all airports per member in parallel via `Promise.allSettled`, picks cheapest
- **Booking links:** Kayak deep-link `kayak.com/flights/{FROM}-{TO}/{DEPART}/{RETURN}` — Google Flights URL deep-linking no longer reliably pre-fills
- **Edge function auth:** `verify_jwt: false` — Supabase runtime rejects ES256 JWTs (new projects default). Auth handled manually via `is_trip_member` RPC
- **Email:** Resend.com chosen for trip status emails — needs `RESEND_API_KEY` as Supabase secret
- **Supabase types:** `src/integrations/supabase/types.ts` fully auto-generated. `customTypes.ts` + `supabaseHelpers.ts` deleted (were re-export stubs only)

## Supabase Project
- URL: https://agbrfodytojzcyvnooec.supabase.co
- Local dev: port 5174; redirect URL = http://localhost:5174/auth/callback
- Migrations applied: 001–009
- GitHub: https://github.com/pjcooley7-ship-it/family-adventure-planner
- Lovable: https://global-family-adventures.lovable.app/

---

## Todo
- [ ] Deploy updated `search-flights` edge function: `brew install supabase/tap/supabase` → `supabase login` → `supabase functions deploy search-flights --project-ref agbrfodytojzcyvnooec`
- [ ] **Phase 4: Email notifications** — DB trigger on `preferences` insert → when `submitted_count = member_count`, invoke `send-notification` Supabase edge function → Resend.com email to trip creator. Needs `RESEND_API_KEY` secret.
- [ ] **Phase 4: Trip status emails** — three triggers: (1) invite sent, (2) all prefs submitted, (3) destination decided. All via same `send-notification` edge function pattern.
- [ ] **Phase 4: Activities API** — replace Claude-generated activity suggestions with GetYourGuide or Viator API results. Pass group interest tags as search query. Show real prices + booking links.
- [ ] Mobile audit of PreferencesPage (low priority — form is mostly single-column already)
- [ ] Push to GitHub + redeploy to confirm all uncommitted session changes are live

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
- **Loose ends cleared:**
  - Deleted `customTypes.ts` + `supabaseHelpers.ts` (were re-export stubs only, no consumers)
  - `search-flights` v2: now tries all of a member's origin airports in parallel via `Promise.allSettled`, returns cheapest result across all of them (was using index 0 only)
  - Date-overlap warning banner added to decided screen in ResultsPage: computes max(earliest_departures) vs min(latest_returns); shows amber warning if windows don't overlap
- Supabase CLI install: `brew install supabase/tap/supabase` (CLI not installed — user needs to run this then deploy search-flights)
- **Next:** Deploy search-flights, then start Phase 4 email notifications with Resend.com
