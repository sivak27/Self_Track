export type IncomeSourceCategory =
  | "salary"
  | "part_time"
  | "freelance"
  | "friends"
  | "investments"
  | "business"
  | "gift"
  | "other";

export type DepositStatus = "received" | "deposited" | "pending";
export type IncomeStatus = DepositStatus;

export interface IncomeSourceOption {
  value: IncomeSourceCategory;
  label: string;
  color: string;
}

export const INCOME_SOURCE_OPTIONS: IncomeSourceOption[] = [
  { value: "salary", label: "Primary Salary", color: "#16A34A" },
  { value: "part_time", label: "Part-time", color: "#0D9488" },
  { value: "freelance", label: "Freelance / Consulting", color: "#4F46E5" },
  { value: "friends", label: "Friends", color: "#EA580C" },
  { value: "investments", label: "Investments & Dividends", color: "#0284C7" },
  { value: "business", label: "Business", color: "#9333EA" },
  { value: "gift", label: "Gift", color: "#EC4899" },
  { value: "other", label: "Other", color: "#64748B" },
];

export interface DepositStatusOption {
  value: DepositStatus;
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const DEPOSIT_STATUS_OPTIONS: DepositStatusOption[] = [
  {
    value: "received",
    label: "Received",
    description: "Received in hand, not yet deposited into tracked bank/account",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
  },
  {
    value: "deposited",
    label: "Deposited",
    description: "Deposited directly into tracked bank/account",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
  },
  {
    value: "pending",
    label: "Pending / Expected",
    description: "Expected income, not yet received",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
  },
];

export function getSourceLabel(src?: string): string {
  const option = INCOME_SOURCE_OPTIONS.find((o) => o.value === src);
  return option ? option.label : "Other";
}

export function getSourceColor(src?: string): string {
  const option = INCOME_SOURCE_OPTIONS.find((o) => o.value === src);
  return option ? option.color : "#64748B";
}

export function getDepositStatusOption(status?: string): DepositStatusOption {
  const found = DEPOSIT_STATUS_OPTIONS.find((s) => s.value === status);
  return (
    found || {
      value: "received",
      label: "Received",
      description: "Received",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      badgeBorder: "border-emerald-200",
    }
  );
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  type: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  source_id: string | null;
  income_source: IncomeSourceCategory;
  deposit_status: DepositStatus;
  amount: number;
  currency: string;
  description: string;
  date: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  source?: IncomeSource | null;
}

export interface CreateIncomeInput {
  source_id?: string | null;
  income_source: IncomeSourceCategory;
  deposit_status: DepositStatus;
  amount: number;
  currency?: string;
  description: string;
  date: string;
  is_recurring?: boolean;
}

export interface UpdateIncomeInput extends Partial<CreateIncomeInput> {}

export interface IncomeFilter {
  startDate?: string;
  endDate?: string;
  sourceId?: string;
  income_source?: IncomeSourceCategory;
  deposit_status?: DepositStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export type IncomeFilters = IncomeFilter;
