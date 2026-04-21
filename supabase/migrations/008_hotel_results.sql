-- Hotel search results cache (populated by search-hotels edge function)
-- One row per hotel option per trip/destination; upserted by position (1–5).

create table hotel_results (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid references trips(id) on delete cascade not null,
  destination_id  uuid references destinations(id) on delete cascade not null,
  position        integer not null,           -- 1–5, used as upsert key
  name            text not null,
  rating          numeric,
  price_per_night numeric,
  currency        text,
  thumbnail       text,
  booking_link    text,
  check_in_date   date,
  check_out_date  date,
  fetched_at      timestamptz not null default now(),
  unique (trip_id, destination_id, position)
);

alter table hotel_results enable row level security;

create policy "hotel_results: members can select"
  on hotel_results for select
  to authenticated
  using (is_trip_member(trip_id));

create policy "hotel_results: service role can manage"
  on hotel_results for all
  to service_role
  with check (true);
