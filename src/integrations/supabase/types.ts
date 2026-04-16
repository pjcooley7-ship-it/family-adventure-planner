export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      api_usage_log: {
        Row: {
          cache_creation_tokens: number
          cache_read_tokens: number
          function_name: string | null
          id: number
          input_tokens: number
          model: string
          output_tokens: number
          project: string
          ts: string
        }
        Insert: {
          cache_creation_tokens?: number
          cache_read_tokens?: number
          function_name?: string | null
          id?: never
          input_tokens?: number
          model: string
          output_tokens?: number
          project: string
          ts?: string
        }
        Update: {
          cache_creation_tokens?: number
          cache_read_tokens?: number
          function_name?: string | null
          id?: never
          input_tokens?: number
          model?: string
          output_tokens?: number
          project?: string
          ts?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          ai_reasoning: string | null
          best_months: string | null
          city: string
          country: string
          country_code: string | null
          created_at: string
          destination_iata: string | null
          flight_note: string | null
          id: string
          match_score: number | null
          rank: number | null
          run_number: number
          trip_id: string
          vibe_tags: string[]
        }
        Insert: {
          ai_reasoning?: string | null
          best_months?: string | null
          city: string
          country: string
          country_code?: string | null
          created_at?: string
          destination_iata?: string | null
          flight_note?: string | null
          id?: string
          match_score?: number | null
          rank?: number | null
          run_number?: number
          trip_id: string
          vibe_tags?: string[]
        }
        Update: {
          ai_reasoning?: string | null
          best_months?: string | null
          city?: string
          country?: string
          country_code?: string | null
          created_at?: string
          destination_iata?: string | null
          flight_note?: string | null
          id?: string
          match_score?: number | null
          rank?: number | null
          run_number?: number
          trip_id?: string
          vibe_tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "destinations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_results: {
        Row: {
          airline: string | null
          airline_logo: string | null
          booking_token: string | null
          currency: string | null
          destination_id: string
          duration_minutes: number | null
          error_message: string | null
          fetched_at: string
          id: string
          origin_iata: string
          outbound_date: string | null
          price: number | null
          return_date: string | null
          stops: number | null
          traveler_name: string
          trip_id: string
          user_id: string
        }
        Insert: {
          airline?: string | null
          airline_logo?: string | null
          booking_token?: string | null
          currency?: string | null
          destination_id: string
          duration_minutes?: number | null
          error_message?: string | null
          fetched_at?: string
          id?: string
          origin_iata: string
          outbound_date?: string | null
          price?: number | null
          return_date?: string | null
          stops?: number | null
          traveler_name: string
          trip_id: string
          user_id: string
        }
        Update: {
          airline?: string | null
          airline_logo?: string | null
          booking_token?: string | null
          currency?: string | null
          destination_id?: string
          duration_minutes?: number | null
          error_message?: string | null
          fetched_at?: string
          id?: string
          origin_iata?: string
          outbound_date?: string | null
          price?: number | null
          return_date?: string | null
          stops?: number | null
          traveler_name?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_results_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_results_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_results_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          accommodation_types: string[]
          activities: string[]
          adults: number
          budget_max: number
          budget_min: number
          currency: string
          earliest_departure: string | null
          flexible_dates: boolean
          id: string
          kids: number
          latest_return: string | null
          origin_airports: string[]
          origin_city: string
          special_requirements: string | null
          submitted_at: string
          traveler_name: string
          trip_duration_max: number
          trip_duration_min: number
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_types?: string[]
          activities?: string[]
          adults?: number
          budget_max?: number
          budget_min?: number
          currency?: string
          earliest_departure?: string | null
          flexible_dates?: boolean
          id?: string
          kids?: number
          latest_return?: string | null
          origin_airports?: string[]
          origin_city: string
          special_requirements?: string | null
          submitted_at?: string
          traveler_name: string
          trip_duration_max?: number
          trip_duration_min?: number
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_types?: string[]
          activities?: string[]
          adults?: number
          budget_max?: number
          budget_min?: number
          currency?: string
          earliest_departure?: string | null
          flexible_dates?: boolean
          id?: string
          kids?: number
          latest_return?: string | null
          origin_airports?: string[]
          origin_city?: string
          special_requirements?: string | null
          submitted_at?: string
          traveler_name?: string
          trip_duration_max?: number
          trip_duration_min?: number
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferences_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time: string | null
          created_at: string
          id: string
          ingredients: Json
          instructions: string[]
          prep_time: string | null
          servings: string | null
          source_name: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          cook_time?: string | null
          created_at?: string
          id?: string
          ingredients?: Json
          instructions?: string[]
          prep_time?: string | null
          servings?: string | null
          source_name?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          cook_time?: string | null
          created_at?: string
          id?: string
          ingredients?: Json
          instructions?: string[]
          prep_time?: string | null
          servings?: string | null
          source_name?: string | null
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      trip_members: {
        Row: {
          display_name: string
          id: string
          joined_at: string
          trip_id: string
          user_id: string
        }
        Insert: {
          display_name: string
          id?: string
          joined_at?: string
          trip_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          joined_at?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          code: string
          created_at: string
          created_by: string
          decided_destination_id: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          code?: string
          created_at?: string
          created_by: string
          decided_destination_id?: string | null
          id?: string
          name: string
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          decided_destination_id?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_decided_destination_id_fkey"
            columns: ["decided_destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          destination_id: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination_id: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination_id?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      trip_summary: {
        Row: {
          code: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          member_count: number | null
          name: string | null
          status: string | null
          submitted_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_trip_code: { Args: never; Returns: string }
      is_trip_member: { Args: { trip_uuid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ── Convenience row-type aliases ──────────────────────────────────────────────
export type Trip        = Tables<'trips'>
export type TripMember  = Tables<'trip_members'>
export type Destination = Tables<'destinations'>
export type FlightResult = Tables<'flight_results'>
export type Preference  = Tables<'preferences'>
export type Vote        = Tables<'votes'>

export type TripStatus = 'collecting' | 'matching' | 'matched' | 'decided'
