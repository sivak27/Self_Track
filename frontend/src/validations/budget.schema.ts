import { z } from "zod";

export const baseBudgetSchema = z.object({
  category_id: z.string().uuid("Please select a valid expense category"),
  amount: z.number().positive("Budget limit must be greater than zero"),
  period: z.enum(["monthly", "yearly"]).default("monthly"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  alert_threshold_pct: z.number().min(1).max(100).default(85),
});

export const createBudgetSchema = baseBudgetSchema.refine(
  (data) => new Date(data.start_date) <= new Date(data.end_date),
  {
    message: "Start date must be on or before end date",
    path: ["end_date"],
  }
);

export const updateBudgetSchema = baseBudgetSchema.partial();

export type CreateBudgetDto = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetDto = z.infer<typeof updateBudgetSchema>;
