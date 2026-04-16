export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type TripStatus = 'collecting' | 'matching' | 'matched' | 'decided'

export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          name: string
          code: string
          created_by: string
          status: TripStatus
          decided_destination_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string
          created_by: string
          status?: TripStatus
          decided_destination_id?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          status?: TripStatus
          decided_destination_id?: string | null
        }
        Relationships: []
      }

      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          display_name: string
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          display_name: string
          joined_at?: string
        }
        Update: {
          display_name?: string
        }
        Relationships: []
      }

      preferences: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          traveler_name: string
          origin_city: string
          adults: number
          kids: number
          earliest_departure: string | null
          latest_return: string | null
          flexible_dates: boolean
          trip_duration_min: number
          trip_duration_max: number
          budget_min: number
          budget_max: number
          currency: string
          activities: string[]
          accommodation_types: string[]
          origin_airports: string[]
          special_requirements: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          traveler_name: string
          origin_city: string
          adults?: number
          kids?: number
          earliest_departure?: string | null
          latest_return?: string | null
          flexible_dates?: boolean
          trip_duration_min?: number
          trip_duration_max?: number
          budget_min?: number
          budget_max?: number
          currency?: string
          activities?: string[]
          accommodation_types?: string[]
          origin_airports?: string[]
          special_requirements?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          traveler_name?: string
          origin_city?: string
          adults?: number
          kids?: number
          earliest_departure?: string | null
          latest_return?: string | null
          flexible_dates?: boolean
          trip_duration_min?: number
          trip_duration_max?: number
          budget_min?: number
          budget_max?: number
          currency?: string
          activities?: string[]
          accommodation_types?: string[]
          origin_airports?: string[]
          special_requirements?: string | null
          updated_at?: string
        }
        Relationships: []
      }

      destinations: {
        Row: {
          id: string
          trip_id: string
          city: string
          country: string
          country_code: string | null
          destination_iata: string | null
          ai_reasoning: string | null
          match_score: number | null
          rank: number | null
          run_number: number
          vibe_tags: string[]
          best_months: string | null
          flight_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          city: string
          country: string
          country_code?: string | null
          destination_iata?: string | null
          ai_reasoning?: string | null
          match_score?: number | null
          rank?: number | null
          run_number?: number
          vibe_tags?: string[]
          best_months?: string | null
          flight_note?: string | null
          created_at?: string
        }
        Update: never
        Relationships: []
      }

      votes: {
        Row: {
          id: string
          trip_id: string
          destination_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          destination_id: string
          user_id: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
    }

      flight_results: {
        Row: {
          id: string
          trip_id: string
          destination_id: string
          user_id: string
          traveler_name: string
          origin_iata: string
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
        Insert: never
        Update: never
        Relationships: []
      }

    Views: {
      trip_summary: {
        Row: {
          id: string
          name: string
          code: string
          status: TripStatus
          created_by: string
          created_at: string
          member_count: number
          submitted_count: number
        }
        Relationships: []
      }
    }

    Functions: {
      generate_trip_code: {
        Args: Record<string, never>
        Returns: string
      }
      is_trip_member: {
        Args: { trip_uuid: string }
        Returns: boolean
      }
    }

    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ── Convenience row types ─────────────────────────────────────
export type Trip          = Database['public']['Tables']['trips']['Row']
export type FlightResult  = Database['public']['Tables']['flight_results']['Row']
export type TripMember  = Database['public']['Tables']['trip_members']['Row']
export type Preferences = Database['public']['Tables']['preferences']['Row']
export type Destination = Database['public']['Tables']['destinations']['Row']
export type Vote        = Database['public']['Tables']['votes']['Row']
export type TripSummary = Database['public']['Views']['trip_summary']['Row']
