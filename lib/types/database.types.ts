export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      child_profiles: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          avatar_url: string | null;
          birth_year: number | null;
          max_daily_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          name: string;
          avatar_url?: string | null;
          birth_year?: number | null;
          max_daily_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          name?: string;
          avatar_url?: string | null;
          birth_year?: number | null;
          max_daily_minutes?: number;
          created_at?: string;
        };
      };
      shows: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          banner_url: string | null;
          creator_name: string | null;
          creator_id: string | null;
          genre: string | null;
          target_age_min: number | null;
          target_age_max: number | null;
          is_public_domain: boolean;
          revenue_share_percentage: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          banner_url?: string | null;
          creator_name?: string | null;
          creator_id?: string | null;
          genre?: string | null;
          target_age_min?: number | null;
          target_age_max?: number | null;
          is_public_domain?: boolean;
          revenue_share_percentage?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          banner_url?: string | null;
          creator_name?: string | null;
          creator_id?: string | null;
          genre?: string | null;
          target_age_min?: number | null;
          target_age_max?: number | null;
          is_public_domain?: boolean;
          revenue_share_percentage?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      episodes: {
        Row: {
          id: string;
          show_id: string;
          title: string;
          description: string | null;
          episode_number: number;
          season_number: number;
          duration_seconds: number;
          video_url: string;
          thumbnail_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          show_id: string;
          title: string;
          description?: string | null;
          episode_number: number;
          season_number?: number;
          duration_seconds: number;
          video_url: string;
          thumbnail_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          show_id?: string;
          title?: string;
          description?: string | null;
          episode_number?: number;
          season_number?: number;
          duration_seconds?: number;
          video_url?: string;
          thumbnail_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      lineups: {
        Row: {
          id: string;
          profile_id: string;
          child_profile_id: string | null;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          child_profile_id?: string | null;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          child_profile_id?: string | null;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lineup_slots: {
        Row: {
          id: string;
          lineup_id: string;
          episode_id: string;
          day_of_week: number;
          time_of_day: string;
          slot_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lineup_id: string;
          episode_id: string;
          day_of_week: number;
          time_of_day: string;
          slot_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lineup_id?: string;
          episode_id?: string;
          day_of_week?: number;
          time_of_day?: string;
          slot_order?: number;
          created_at?: string;
        };
      };
      watch_history: {
        Row: {
          id: string;
          profile_id: string;
          child_profile_id: string | null;
          episode_id: string;
          lineup_id: string | null;
          watched_at: string;
          progress_seconds: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          child_profile_id?: string | null;
          episode_id: string;
          lineup_id?: string | null;
          watched_at?: string;
          progress_seconds?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          child_profile_id?: string | null;
          episode_id?: string;
          lineup_id?: string | null;
          watched_at?: string;
          progress_seconds?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          plan_type: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status: string;
          plan_type: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          plan_type?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
