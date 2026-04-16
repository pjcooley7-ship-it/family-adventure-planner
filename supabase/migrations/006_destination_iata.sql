-- Add nearest major airport IATA code to destinations
-- Used for flight/hotel searches in Phase 3

alter table destinations
  add column destination_iata text;
