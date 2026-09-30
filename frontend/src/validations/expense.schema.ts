import { z } from "zod";

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name is too long"),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid color hex format").default("#06B6D4"),
  icon: z.string().default("Tag"),
});

export const createExpenseSchema = z.object({
  category_id: z.string().uuid("Invalid category ID").nullable().optional(),
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().default("USD"),
  description: z.string().min(1, "Description is required").max(200, "Description is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  payment_method: z.enum(["credit_card", "debit_card", "bank_transfer", "cash", "crypto", "other"]).default("credit_card"),
  is_recurring: z.boolean().default(false),
  receipt_url: z.string().url("Invalid receipt URL").nullable().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ExpenseCategoryDto = z.infer<typeof expenseCategorySchema>;
