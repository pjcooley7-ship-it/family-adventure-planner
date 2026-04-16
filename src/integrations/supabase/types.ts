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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          home_address: string | null
          home_city: string | null
          home_country: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          home_address?: string | null
          home_city?: string | null
          home_country?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          home_address?: string | null
          home_city?: string | null
          home_country?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      traveler_info: {
        Row: {
          activity_preferences: string[] | null
          additional_notes: string | null
          availability_end: string | null
          availability_start: string | null
          budget_currency: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          dietary_restrictions: string[] | null
          home_address: string | null
          home_city: string | null
          home_country: string | null
          id: string
          mobility_needs: string | null
          places_to_avoid: string[] | null
          preferred_destinations: string[] | null
          submitted_at: string | null
          travelers: Json
          trip_member_id: string
          updated_at: string
        }
        Insert: {
          activity_preferences?: string[] | null
          additional_notes?: string | null
          availability_end?: string | null
          availability_start?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          dietary_restrictions?: string[] | null
          home_address?: string | null
          home_city?: string | null
          home_country?: string | null
          id?: string
          mobility_needs?: string | null
          places_to_avoid?: string[] | null
          preferred_destinations?: string[] | null
          submitted_at?: string | null
          travelers?: Json
          trip_member_id: string
          updated_at?: string
        }
        Update: {
          activity_preferences?: string[] | null
          additional_notes?: string | null
          availability_end?: string | null
          availability_start?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          dietary_restrictions?: string[] | null
          home_address?: string | null
          home_city?: string | null
          home_country?: string | null
          id?: string
          mobility_needs?: string | null
          places_to_avoid?: string[] | null
          preferred_destinations?: string[] | null
          submitted_at?: string | null
          travelers?: Json
          trip_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_info_trip_member_id_fkey"
            columns: ["trip_member_id"]
            isOneToOne: true
            referencedRelation: "trip_members"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          email: string
          id: string
          invited_at: string
          responded_at: string | null
          status: Database["public"]["Enums"]["member_status"]
          trip_id: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          invited_at?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          trip_id: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          invited_at?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          trip_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_recommendations: {
        Row: {
          activity_suggestions: Json | null
          cost_estimates: Json | null
          created_at: string
          date_suggestions: Json | null
          destination_suggestions: Json | null
          generated_at: string
          id: string
          lodging_suggestions: Json | null
          transportation_suggestions: Json | null
          trip_id: string
        }
        Insert: {
          activity_suggestions?: Json | null
          cost_estimates?: Json | null
          created_at?: string
          date_suggestions?: Json | null
          destination_suggestions?: Json | null
          generated_at?: string
          id?: string
          lodging_suggestions?: Json | null
          transportation_suggestions?: Json | null
          trip_id: string
        }
        Update: {
          activity_suggestions?: Json | null
          cost_estimates?: Json | null
          created_at?: string
          date_suggestions?: Json | null
          destination_suggestions?: Json | null
          generated_at?: string
          id?: string
          lodging_suggestions?: Json | null
          transportation_suggestions?: Json | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_recommendations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organizer_id: string
          status: Database["public"]["Enums"]["trip_status"]
          target_end_date: string | null
          target_start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organizer_id: string
          status?: Database["public"]["Enums"]["trip_status"]
          target_end_date?: string | null
          target_start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organizer_id?: string
          status?: Database["public"]["Enums"]["trip_status"]
          target_end_date?: string | null
          target_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_trip: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_trip_member: {
        Args: { _trip_member_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_trip: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      get_profile_id: { Args: { _user_id: string }; Returns: string }
      is_trip_member: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      is_trip_organizer: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      member_status: "pending" | "accepted" | "declined"
      trip_status: "planning" | "confirmed" | "completed" | "cancelled"
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
    Enums: {
      member_status: ["pending", "accepted", "declined"],
      trip_status: ["planning", "confirmed", "completed", "cancelled"],
    },
  },
} as const
