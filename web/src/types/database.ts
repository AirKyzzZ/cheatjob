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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      billing_events: {
        Row: {
          amount_cents: number | null
          created_at: string
          id: string
          plan: string | null
          processed_at: string | null
          processing_error: string | null
          raw_event: Json
          stripe_customer_id: string | null
          stripe_event_id: string
          stripe_event_type: string
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          plan?: string | null
          processed_at?: string | null
          processing_error?: string | null
          raw_event: Json
          stripe_customer_id?: string | null
          stripe_event_id: string
          stripe_event_type: string
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          plan?: string | null
          processed_at?: string | null
          processing_error?: string | null
          raw_event?: Json
          stripe_customer_id?: string | null
          stripe_event_id?: string
          stripe_event_type?: string
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          attempts: number
          candidature_id: string | null
          created_at: string
          id: string
          kind: string
          last_error: string | null
          send_after: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          attempts?: number
          candidature_id?: string | null
          created_at?: string
          id?: string
          kind: string
          last_error?: string | null
          send_after: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          attempts?: number
          candidature_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          last_error?: string | null
          send_after?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      candidatures: {
        Row: {
          closed_at: string | null
          closed_reason: string | null
          company_domain: string | null
          company_name: string
          company_website: string | null
          created_at: string
          id: string
          manager_email: string | null
          manager_email_confidence: string | null
          manager_email_provider: string | null
          manager_first_name: string | null
          manager_last_name: string | null
          manager_linkedin_url: string | null
          manager_role: string | null
          notes: string | null
          offer_text: string | null
          offer_url: string | null
          replied_at: string | null
          sent_at: string | null
          status: string
          target_role: string | null
          updated_at: string
          user_id: string
          wizard_step: number
        }
        Insert: {
          closed_at?: string | null
          closed_reason?: string | null
          company_domain?: string | null
          company_name: string
          company_website?: string | null
          created_at?: string
          id?: string
          manager_email?: string | null
          manager_email_confidence?: string | null
          manager_email_provider?: string | null
          manager_first_name?: string | null
          manager_last_name?: string | null
          manager_linkedin_url?: string | null
          manager_role?: string | null
          notes?: string | null
          offer_text?: string | null
          offer_url?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string
          target_role?: string | null
          updated_at?: string
          user_id: string
          wizard_step?: number
        }
        Update: {
          closed_at?: string | null
          closed_reason?: string | null
          company_domain?: string | null
          company_name?: string
          company_website?: string | null
          created_at?: string
          id?: string
          manager_email?: string | null
          manager_email_confidence?: string | null
          manager_email_provider?: string | null
          manager_first_name?: string | null
          manager_last_name?: string | null
          manager_linkedin_url?: string | null
          manager_role?: string | null
          notes?: string | null
          offer_text?: string | null
          offer_url?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string
          target_role?: string | null
          updated_at?: string
          user_id?: string
          wizard_step?: number
        }
        Relationships: []
      }
      email_lookups: {
        Row: {
          candidature_id: string | null
          confidence: string | null
          cost_usd: number | null
          created_at: string
          id: string
          provider: string
          query: Json
          raw_response: Json | null
          result_email: string | null
          user_id: string
        }
        Insert: {
          candidature_id?: string | null
          confidence?: string | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          provider: string
          query: Json
          raw_response?: Json | null
          result_email?: string | null
          user_id: string
        }
        Update: {
          candidature_id?: string | null
          confidence?: string | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          provider?: string
          query?: Json
          raw_response?: Json | null
          result_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_lookups_candidature_id_fkey"
            columns: ["candidature_id"]
            isOneToOne: false
            referencedRelation: "candidatures"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          candidature_id: string
          created_at: string
          edited_by_user: boolean
          generated_by_model: string | null
          generation_cost_usd: number | null
          id: string
          prompt_version: string | null
          subject: string
          type: string
          user_edited_body: string | null
          user_id: string
        }
        Insert: {
          body: string
          candidature_id: string
          created_at?: string
          edited_by_user?: boolean
          generated_by_model?: string | null
          generation_cost_usd?: number | null
          id?: string
          prompt_version?: string | null
          subject: string
          type?: string
          user_edited_body?: string | null
          user_id: string
        }
        Update: {
          body?: string
          candidature_id?: string
          created_at?: string
          edited_by_user?: boolean
          generated_by_model?: string | null
          generation_cost_usd?: number | null
          id?: string
          prompt_version?: string | null
          subject?: string
          type?: string
          user_edited_body?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_candidature_id_fkey"
            columns: ["candidature_id"]
            isOneToOne: false
            referencedRelation: "candidatures"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          created_at: string
          current_plan: string | null
          cv_extracted: Json | null
          cv_storage_path: string | null
          cv_uploaded_at: string | null
          field_of_study: string | null
          full_name: string | null
          locale: string
          onboarded_at: string | null
          plan_ends_at: string | null
          plan_started_at: string | null
          quota_resets_at: string | null
          quota_total: number
          quota_used: number
          school: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          study_level: string | null
          target_contract_types: string[] | null
          target_role_keywords: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about_me?: string | null
          created_at?: string
          current_plan?: string | null
          cv_extracted?: Json | null
          cv_storage_path?: string | null
          cv_uploaded_at?: string | null
          field_of_study?: string | null
          full_name?: string | null
          locale?: string
          onboarded_at?: string | null
          plan_ends_at?: string | null
          plan_started_at?: string | null
          quota_resets_at?: string | null
          quota_total?: number
          quota_used?: number
          school?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          study_level?: string | null
          target_contract_types?: string[] | null
          target_role_keywords?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about_me?: string | null
          created_at?: string
          current_plan?: string | null
          cv_extracted?: Json | null
          cv_storage_path?: string | null
          cv_uploaded_at?: string | null
          field_of_study?: string | null
          full_name?: string | null
          locale?: string
          onboarded_at?: string | null
          plan_ends_at?: string | null
          plan_started_at?: string | null
          quota_resets_at?: string | null
          quota_total?: number
          quota_used?: number
          school?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          study_level?: string | null
          target_contract_types?: string[] | null
          target_role_keywords?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_rate_limits: {
        Row: {
          ip: string
          day: string
          count: number
        }
        Insert: {
          ip: string
          day: string
          count?: number
        }
        Update: {
          ip?: string
          day?: string
          count?: number
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
          plan: string | null
          source: string | null
          utm: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string
          plan?: string | null
          source?: string | null
          utm?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
          plan?: string | null
          source?: string | null
          utm?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_quota: { Args: { p_user_id: string }; Returns: boolean }
      add_credits: { Args: { p_user_id: string; p_credits: number; p_session_id: string }; Returns: number }
      tool_consume: { Args: { p_ip: string; p_cap?: number }; Returns: boolean }
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
