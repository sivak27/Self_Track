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
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          updated_at?: string;
        };
      };
      expense_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          color?: string;
          icon?: string;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          amount: number;
          currency: string;
          description: string;
          date: string;
          payment_method: string;
          is_recurring: boolean;
          receipt_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          amount: number;
          currency?: string;
          description: string;
          date?: string;
          payment_method?: string;
          is_recurring?: boolean;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          amount?: number;
          currency?: string;
          description?: string;
          date?: string;
          payment_method?: string;
          is_recurring?: boolean;
          receipt_url?: string | null;
          updated_at?: string;
        };
      };
      income_sources: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          color?: string;
          updated_at?: string;
        };
      };
      income: {
        Row: {
          id: string;
          user_id: string;
          source_id: string | null;
          amount: number;
          currency: string;
          description: string;
          date: string;
          is_recurring: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_id?: string | null;
          amount: number;
          currency?: string;
          description: string;
          date?: string;
          is_recurring?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          source_id?: string | null;
          amount?: number;
          currency?: string;
          description?: string;
          date?: string;
          is_recurring?: boolean;
          status?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          period: string;
          start_date: string;
          end_date: string;
          alert_threshold_pct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          period?: string;
          start_date: string;
          end_date: string;
          alert_threshold_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          amount?: number;
          period?: string;
          start_date?: string;
          end_date?: string;
          alert_threshold_pct?: number;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          color: string;
          start_date: string | null;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          color?: string;
          start_date?: string | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          color?: string;
          start_date?: string | null;
          target_date?: string | null;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          goal_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          estimated_minutes: number | null;
          actual_minutes: number | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          goal_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          estimated_minutes?: number | null;
          actual_minutes?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string | null;
          goal_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          estimated_minutes?: number | null;
          actual_minutes?: number | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          target_value: number;
          current_value: number;
          unit: string;
          target_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          target_value: number;
          current_value?: number;
          unit?: string;
          target_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: string;
          target_value?: number;
          current_value?: number;
          unit?: string;
          target_date?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          currency: string;
          date_format: string;
          theme: string;
          email_notifications: boolean;
          weekly_summary_enabled: boolean;
          budget_alert_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          currency?: string;
          date_format?: string;
          theme?: string;
          email_notifications?: boolean;
          weekly_summary_enabled?: boolean;
          budget_alert_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          currency?: string;
          date_format?: string;
          theme?: string;
          email_notifications?: boolean;
          weekly_summary_enabled?: boolean;
          budget_alert_notifications?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}
