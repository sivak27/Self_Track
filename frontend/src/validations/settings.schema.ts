import { z } from "zod";

export const updateSettingsSchema = z.object({
  currency: z.string().min(1).max(5).default("USD"),
  date_format: z.string().default("YYYY-MM-DD"),
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  email_notifications: z.boolean().default(true),
  weekly_summary_enabled: z.boolean().default(true),
  budget_alert_notifications: z.boolean().default(true),
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
