// Types for tables not yet in the auto-generated Supabase types
// These should be removed once the corresponding tables exist in the schema

export interface FlightResult {
  id: string
  trip_id: string
  destination_id: string
  user_id: string | null
  traveler_name: string | null
  origin_iata: string | null
  price: number | null
  currency: string | null
  airline: string | null
  airline_logo: string | null
  outbound_date: string | null
  return_date: string | null
  duration_minutes: number | null
  stops: number | null
  booking_token: string | null
  error_message: string | null
  fetched_at: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Destination = Record<string, any>
