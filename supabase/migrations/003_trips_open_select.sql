-- Allow any authenticated user to read trips.
-- This is needed so users can look up a trip by code before joining.
-- Sensitive data (preferences, member details) is protected by its own RLS policies.

drop policy "trips: members can select" on trips;

create policy "trips: authenticated users can select"
  on trips for select
  to authenticated
  using (true);
