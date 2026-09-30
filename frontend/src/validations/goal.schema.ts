import { z } from "zod";

export const baseGoalSchema = z.object({
  title: z.string().min(1, "Goal title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
  category: z.enum([
    "financial_savings",
    "financial_investment",
    "productivity",
    "career",
    "personal",
  ]).default("financial_savings"),
  target_value: z.number().positive("Target value must be greater than zero"),
  current_value: z.number().min(0, "Current progress cannot be negative").default(0),
  unit: z.string().max(10).default("$"),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").nullable().optional(),
  status: z.enum(["not_started", "in_progress", "achieved", "paused"]).default("in_progress"),
});

export const createGoalSchema = baseGoalSchema;
export const updateGoalSchema = baseGoalSchema.partial();

export type CreateGoalDto = z.infer<typeof createGoalSchema>;
export type UpdateGoalDto = z.infer<typeof updateGoalSchema>;
