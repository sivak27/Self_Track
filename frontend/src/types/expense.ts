export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = "credit_card" | "debit_card" | "bank_transfer" | "cash" | "crypto" | "other";

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  description: string;
  date: string;
  payment_method: PaymentMethod;
  is_recurring: boolean;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory | null;
}

export interface CreateExpenseInput {
  category_id?: string | null;
  amount: number;
  currency?: string;
  description: string;
  date?: string;
  payment_method?: PaymentMethod;
  is_recurring?: boolean;
  receipt_url?: string | null;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  search?: string;
  limit?: number;
  offset?: number;
}

export type ExpenseFilters = ExpenseFilter;

