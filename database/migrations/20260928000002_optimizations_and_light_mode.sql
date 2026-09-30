-- ==============================================================================
-- PERSONAL CONTROL CENTER - OPTIMIZATIONS & LIGHT MODE MIGRATION
-- ==============================================================================

-- 1. Update handle_new_user trigger function to use 'light' theme as default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  INSERT INTO public.user_settings (user_id, currency, theme)
  VALUES (NEW.id, 'USD', 'light')
  ON CONFLICT (user_id) DO UPDATE SET theme = 'light';

  -- Seed default expense categories for the user
  INSERT INTO public.expense_categories (user_id, name, color, icon, is_default)
  VALUES
    (NEW.id, 'Housing & Rent', '#4F46E5', 'Home', true),
    (NEW.id, 'Groceries & Food', '#16A34A', 'Utensils', true),
    (NEW.id, 'Transportation', '#D97706', 'Car', true),
    (NEW.id, 'Utilities & Bills', '#9333EA', 'Zap', true),
    (NEW.id, 'Entertainment', '#DB2777', 'Film', true),
    (NEW.id, 'Health & Fitness', '#0284C7', 'Activity', true),
    (NEW.id, 'Personal & Shopping', '#4F46E5', 'ShoppingBag', true),
    (NEW.id, 'Other', '#64748B', 'MoreHorizontal', true)
  ON CONFLICT DO NOTHING;

  -- Seed default income sources for the user
  INSERT INTO public.income_sources (user_id, name, type, color)
  VALUES
    (NEW.id, 'Primary Salary', 'salary', '#16A34A'),
    (NEW.id, 'Freelance / Consulting', 'freelance', '#4F46E5'),
    (NEW.id, 'Investments & Dividends', 'investment', '#0284C7')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing user settings default theme to light
UPDATE public.user_settings
SET theme = 'light'
WHERE theme = 'dark';

-- 3. Composite and Covering Indexes for Analytics and High-Throughput Filtering
CREATE INDEX IF NOT EXISTS idx_income_user_date 
  ON public.income(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_income_source 
  ON public.income(source_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period 
  ON public.budgets(user_id, period, start_date);

CREATE INDEX IF NOT EXISTS idx_budgets_category 
  ON public.budgets(category_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_status 
  ON public.projects(user_id, status);

CREATE INDEX IF NOT EXISTS idx_goals_user_status 
  ON public.goals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_user_priority 
  ON public.tasks(user_id, priority);

CREATE INDEX IF NOT EXISTS idx_tasks_user_completed 
  ON public.tasks(user_id, completed_at DESC);

-- 4. Prevent duplicate category and source names per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_expense_categories_unique_user_name 
  ON public.expense_categories(user_id, lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS idx_income_sources_unique_user_name 
  ON public.income_sources(user_id, lower(name));
