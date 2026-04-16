-- Flight search results cache (populated by search-flights edge function)

create table flight_results (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid references trips(id) on delete cascade not null,
  destination_id  uuid references destinations(id) on delete cascade not null,
  user_id         uuid references auth.users not null,
  traveler_name   text not null,
  origin_iata     text not null,
  price           numeric,
  currency        text,
  airline         text,
  airline_logo    text,
  outbound_date   date,
  return_date     date,
  duration_minutes integer,
  stops           integer,
  booking_token   text,
  error_message   text,       -- set when search failed for this member
  fetched_at      timestamptz not null default now(),
  unique (trip_id, destination_id, user_id)
);

alter table flight_results enable row level security;

create policy "flight_results: members can select"
  on flight_results for select
  to authenticated
  using (is_trip_member(trip_id));

create policy "flight_results: service role can manage"
  on flight_results for all
  to service_role
  with check (true);
