// Placeholder Supabase types. Regenerate with:
//   supabase gen types typescript --project-id <ref> --schema public > web/src/types/database.ts
// Run after Supabase project is provisioned and migrations are applied.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Locale = "fr" | "en" | "es" | "de";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          school: string | null;
          study_level: "L3" | "M1" | "M2" | "BTS2" | "DUT2" | "other" | null;
          field_of_study: string | null;
          target_contract_types: string[];
          target_role_keywords: string[];
          about_me: string | null;
          cv_storage_path: string | null;
          cv_extracted: Json | null;
          cv_uploaded_at: string | null;
          current_plan: "free" | "sprint" | "mois" | "vie" | null;
          plan_started_at: string | null;
          plan_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          quota_total: number;
          quota_used: number;
          quota_resets_at: string | null;
          locale: Locale;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          school?: string | null;
          study_level?: "L3" | "M1" | "M2" | "BTS2" | "DUT2" | "other" | null;
          field_of_study?: string | null;
          target_contract_types?: string[];
          target_role_keywords?: string[];
          about_me?: string | null;
          cv_storage_path?: string | null;
          cv_extracted?: Json | null;
          cv_uploaded_at?: string | null;
          current_plan?: "free" | "sprint" | "mois" | "vie" | null;
          plan_started_at?: string | null;
          plan_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          quota_total?: number;
          quota_used?: number;
          quota_resets_at?: string | null;
          locale: Locale;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      waitlist_entries: {
        Row: {
          id: string;
          email: string;
          plan: "sprint" | "mois" | "vie" | null;
          source: string | null;
          utm: Json | null;
          locale: Locale;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          plan?: "sprint" | "mois" | "vie" | null;
          source?: string | null;
          utm?: Json | null;
          locale?: Locale;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["waitlist_entries"]["Insert"]>;
        Relationships: [];
      };
      billing_events: {
        Row: {
          id: string;
          user_id: string | null;
          stripe_event_id: string;
          stripe_event_type: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: string | null;
          amount_cents: number | null;
          raw_event: Json;
          processed_at: string | null;
          processing_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          stripe_event_id: string;
          stripe_event_type: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: string | null;
          amount_cents?: number | null;
          raw_event: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
