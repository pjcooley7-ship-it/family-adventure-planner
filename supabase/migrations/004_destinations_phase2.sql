-- ============================================================
-- Phase 2: destinations — run history + richer fields
-- ============================================================

-- run_number: increments on each re-run; old runs are preserved
ALTER TABLE destinations
  ADD COLUMN run_number integer NOT NULL DEFAULT 1;

-- vibe tags like ["Beach", "Culture", "Nightlife"]
ALTER TABLE destinations
  ADD COLUMN vibe_tags text[] NOT NULL DEFAULT '{}';

-- e.g. "May–September" or "Year-round"
ALTER TABLE destinations
  ADD COLUMN best_months text;

-- e.g. "4–7 hrs from group origins"
ALTER TABLE destinations
  ADD COLUMN flight_note text;

-- Make existing rows explicitly run 1 (they already default to 1, just explicit)
UPDATE destinations SET run_number = 1 WHERE run_number = 1;
