-- Operational Intelligence Tables
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. SEARCH INDEX TABLE (Unified Search)
-- ============================================
CREATE TABLE IF NOT EXISTS search_index (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'task', 'note', 'reminder', 'recording', 'goal', 'event', 'email'
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  keywords TEXT[], -- AI-extracted keywords
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- Policies for search_index
CREATE POLICY "Users can view their own search index"
  ON search_index FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search index entries"
  ON search_index FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search index entries"
  ON search_index FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search index entries"
  ON search_index FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for search
CREATE INDEX idx_search_index_user ON search_index(user_id);
CREATE INDEX idx_search_index_type ON search_index(user_id, entity_type);
CREATE INDEX idx_search_index_title ON search_index USING gin(to_tsvector('english', title));
CREATE INDEX idx_search_index_content ON search_index USING gin(to_tsvector('english', COALESCE(content, '')));

-- ============================================
-- 2. RISK ALERTS TABLE (Pattern Detection)
-- ============================================
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'overdue_task', 'missed_deadline', 'calendar_conflict', 'habit_break', 'goal_stall', 'budget_exceed'
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for risk_alerts
CREATE POLICY "Users can view their own risk alerts"
  ON risk_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own risk alerts"
  ON risk_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk alerts"
  ON risk_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own risk alerts"
  ON risk_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Index for unacknowledged alerts
CREATE INDEX idx_risk_alerts_user_unack ON risk_alerts(user_id, acknowledged) WHERE NOT acknowledged;
CREATE INDEX idx_risk_alerts_user_date ON risk_alerts(user_id, created_at DESC);

-- ============================================
-- 3. FINANCIAL ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense', 'transfer', 'investment')),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

-- Policies for financial_entries
CREATE POLICY "Users can view their own financial entries"
  ON financial_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial entries"
  ON financial_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial entries"
  ON financial_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial entries"
  ON financial_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for financial queries
CREATE INDEX idx_financial_entries_user_date ON financial_entries(user_id, date DESC);
CREATE INDEX idx_financial_entries_user_category ON financial_entries(user_id, category);
CREATE INDEX idx_financial_entries_user_type ON financial_entries(user_id, entry_type);

-- ============================================
-- 4. FINANCIAL BUDGETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

-- Enable RLS
ALTER TABLE financial_budgets ENABLE ROW LEVEL SECURITY;

-- Policies for financial_budgets
CREATE POLICY "Users can view their own budgets"
  ON financial_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets"
  ON financial_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON financial_budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON financial_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Index for active budgets
CREATE INDEX idx_financial_budgets_user_active ON financial_budgets(user_id, is_active);

-- ============================================
-- 5. APPLY UPDATE TRIGGERS
-- ============================================
CREATE TRIGGER update_search_index_updated_at
  BEFORE UPDATE ON search_index
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_entries_updated_at
  BEFORE UPDATE ON financial_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_budgets_updated_at
  BEFORE UPDATE ON financial_budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Run this SQL in Supabase SQL Editor
-- ============================================
