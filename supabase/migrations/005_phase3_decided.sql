-- ============================================================
-- Phase 3: "It's decided!" state
-- Adds decided_destination_id to trips and expands status values
-- ============================================================

-- Add the decided destination reference
alter table trips
  add column decided_destination_id uuid references destinations(id) on delete set null;

-- Expand the status check constraint to include 'decided'
alter table trips drop constraint trips_status_check;
alter table trips add constraint trips_status_check
  check (status in ('collecting', 'matching', 'matched', 'decided'));
