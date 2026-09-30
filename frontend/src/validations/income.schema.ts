import { z } from "zod";

export const incomeSourceCategoryEnum = z.enum(
  [
    "salary",
    "part_time",
    "freelance",
    "friends",
    "investments",
    "business",
    "gift",
    "other",
  ],
  {
    errorMap: () => ({ message: "Please select an income source" }),
  }
);

export const depositStatusEnum = z.enum(["received", "deposited", "pending"], {
  errorMap: () => ({ message: "Please select a deposit status" }),
});

export const incomeSourceSchema = z.object({
  name: z.string().min(1, "Source name is required").max(60, "Source name is too long"),
  type: z.enum([
    "salary",
    "part_time",
    "freelance",
    "friends",
    "investments",
    "business",
    "gift",
    "other",
  ]).default("salary"),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid color hex format").default("#10B981"),
});

export const createIncomeSchema = z.object({
  source_id: z.string().uuid("Invalid source ID").nullable().optional(),
  income_source: incomeSourceCategoryEnum,
  deposit_status: depositStatusEnum,
  amount: z.number({ required_error: "Amount is required" }).positive("Amount must be greater than zero"),
  currency: z.string().default("USD"),
  description: z.string().min(1, "Description is required").max(255, "Description is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  is_recurring: z.boolean().default(false),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const incomeFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sourceId: z.string().optional(),
  income_source: incomeSourceCategoryEnum.optional(),
  deposit_status: depositStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateIncomeDto = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeDto = z.infer<typeof updateIncomeSchema>;
export type IncomeSourceDto = z.infer<typeof incomeSourceSchema>;
