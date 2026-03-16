-- Add origin_airports array to store selected IATA codes
-- origin_city repurposed as the human-readable city label (e.g. "Winfield, PA, United States")
alter table preferences
  add column if not exists origin_airports text[] not null default '{}';
