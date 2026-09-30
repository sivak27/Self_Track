export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  date_format: string;
  theme: "dark" | "light" | "system";
  email_notifications: boolean;
  weekly_summary_enabled: boolean;
  budget_alert_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsInput {
  currency?: string;
  date_format?: string;
  theme?: "dark" | "light" | "system";
  email_notifications?: boolean;
  weekly_summary_enabled?: boolean;
  budget_alert_notifications?: boolean;
}

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
  currency?: string;
}
