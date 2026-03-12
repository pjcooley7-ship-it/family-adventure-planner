-- ============================================================
-- Wanderlust — initial schema
-- ============================================================

-- ── Helper: generate a short invite code ─────────────────────
create or replace function generate_trip_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no confusables (0/O, 1/I)
  code  text := '';
  i     int;
begin
  for i in 1..6 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return code;
end;
$$;

-- ── Helper: check trip membership (used in RLS) ──────────────
create or replace function is_trip_member(trip_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from trip_members
    where trip_id = trip_uuid
      and user_id = auth.uid()
  );
$$;

-- ── trips ────────────────────────────────────────────────────
create table trips (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text unique not null default generate_trip_code(),
  created_by uuid references auth.users not null,
  status     text not null default 'collecting'
             check (status in ('collecting', 'matching', 'matched')),
  created_at timestamptz not null default now()
);

alter table trips enable row level security;

-- Anyone authenticated can create a trip
create policy "trips: authenticated users can insert"
  on trips for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Members (and creator) can read the trip
create policy "trips: members can select"
  on trips for select
  to authenticated
  using (created_by = auth.uid() or is_trip_member(id));

-- Only creator can update
create policy "trips: creator can update"
  on trips for update
  to authenticated
  using (created_by = auth.uid());

-- ── trip_members ─────────────────────────────────────────────
create table trip_members (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid references trips(id) on delete cascade not null,
  user_id      uuid references auth.users not null,
  display_name text not null,
  joined_at    timestamptz not null default now(),
  unique (trip_id, user_id)
);

alter table trip_members enable row level security;

-- Members of the same trip can see each other
create policy "trip_members: members can select"
  on trip_members for select
  to authenticated
  using (is_trip_member(trip_id) or user_id = auth.uid());

-- Any authenticated user can join a trip (insert themselves)
create policy "trip_members: authenticated can insert"
  on trip_members for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can remove themselves
create policy "trip_members: users can delete own"
  on trip_members for delete
  to authenticated
  using (auth.uid() = user_id);

-- ── preferences ──────────────────────────────────────────────
create table preferences (
  id                   uuid primary key default gen_random_uuid(),
  trip_id              uuid references trips(id) on delete cascade not null,
  user_id              uuid references auth.users not null,

  -- Step 1: Who
  traveler_name        text not null,
  origin_city          text not null,
  adults               integer not null default 1,
  kids                 integer not null default 0,

  -- Step 2: When
  earliest_departure   date,
  latest_return        date,
  flexible_dates       boolean not null default false,
  trip_duration_min    integer not null default 5,
  trip_duration_max    integer not null default 10,

  -- Step 3: Budget
  budget_min           numeric not null default 0,
  budget_max           numeric not null default 0,
  currency             text not null default 'USD',

  -- Step 4: Interests
  activities           text[] not null default '{}',
  accommodation_types  text[] not null default '{}',

  -- Step 5: Notes
  special_requirements text,

  submitted_at         timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  unique (trip_id, user_id)
);

alter table preferences enable row level security;

-- Trip members can read all preferences for that trip
create policy "preferences: members can select"
  on preferences for select
  to authenticated
  using (is_trip_member(trip_id));

-- Users insert their own preferences
create policy "preferences: users can insert own"
  on preferences for insert
  to authenticated
  with check (auth.uid() = user_id and is_trip_member(trip_id));

-- Users update their own preferences
create policy "preferences: users can update own"
  on preferences for update
  to authenticated
  using (auth.uid() = user_id);

-- Auto-update updated_at on edit
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger preferences_updated_at
  before update on preferences
  for each row execute function update_updated_at();

-- ── destinations (AI-generated results) ─────────────────────
create table destinations (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid references trips(id) on delete cascade not null,
  city         text not null,
  country      text not null,
  country_code text,
  ai_reasoning text,
  match_score  numeric,
  rank         integer,
  created_at   timestamptz not null default now()
);

alter table destinations enable row level security;

create policy "destinations: members can select"
  on destinations for select
  to authenticated
  using (is_trip_member(trip_id));

-- Only service role inserts destinations (from edge function)
create policy "destinations: service role can insert"
  on destinations for insert
  to service_role
  with check (true);

-- ── votes ────────────────────────────────────────────────────
create table votes (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid references trips(id) on delete cascade not null,
  destination_id uuid references destinations(id) on delete cascade not null,
  user_id        uuid references auth.users not null,
  created_at     timestamptz not null default now(),
  unique (trip_id, user_id)  -- one vote per person per trip
);

alter table votes enable row level security;

create policy "votes: members can select"
  on votes for select
  to authenticated
  using (is_trip_member(trip_id));

create policy "votes: users can insert own"
  on votes for insert
  to authenticated
  with check (auth.uid() = user_id and is_trip_member(trip_id));

-- Allow changing vote (delete + reinsert)
create policy "votes: users can delete own"
  on votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ── Useful view: trip summary ─────────────────────────────────
create view trip_summary as
select
  t.id,
  t.name,
  t.code,
  t.status,
  t.created_by,
  t.created_at,
  count(distinct tm.user_id)  as member_count,
  count(distinct p.user_id)   as submitted_count
from trips t
left join trip_members tm on tm.trip_id = t.id
left join preferences  p  on p.trip_id  = t.id
group by t.id;
