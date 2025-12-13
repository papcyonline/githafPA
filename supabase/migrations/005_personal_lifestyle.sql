-- Personal & Lifestyle Tables
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. PERSONAL EVENTS TABLE (Birthdays, Anniversaries)
-- ============================================
CREATE TABLE IF NOT EXISTS personal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'holiday', 'memorial', 'other')),
  person_name TEXT NOT NULL,
  relationship TEXT, -- 'family', 'friend', 'colleague', 'partner', 'other'
  event_date DATE NOT NULL, -- Stores month/day, year for specific dates
  year_known BOOLEAN DEFAULT TRUE,
  notes TEXT,
  reminder_days_before INTEGER[] DEFAULT ARRAY[7, 1, 0],
  gift_ideas TEXT[],
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

-- Policies for personal_events
CREATE POLICY "Users can view their own personal events"
  ON personal_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personal events"
  ON personal_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal events"
  ON personal_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal events"
  ON personal_events FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_personal_events_user ON personal_events(user_id);
CREATE INDEX idx_personal_events_date ON personal_events(user_id, event_date);

-- ============================================
-- 2. DAILY CHECK-INS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('morning', 'midday', 'evening', 'custom')),
  checkin_date DATE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  gratitude_items TEXT[],
  wins TEXT[],
  challenges TEXT[],
  tomorrow_priorities TEXT[],
  journal_entry TEXT,
  ai_response TEXT,
  ai_insights JSONB, -- AI-generated insights and patterns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date, checkin_type)
);

-- Enable RLS
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Policies for daily_checkins
CREATE POLICY "Users can view their own check-ins"
  ON daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
  ON daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
  ON daily_checkins FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date DESC);
CREATE INDEX idx_daily_checkins_type ON daily_checkins(user_id, checkin_type);

-- ============================================
-- 3. AI CONVERSATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_type TEXT NOT NULL, -- 'checkin', 'emotional_support', 'task_help', 'general', 'reflection'
  title TEXT,
  messages JSONB NOT NULL, -- [{role: 'user'|'assistant', content: '...', timestamp: '...'}]
  context_summary TEXT, -- AI-generated summary for future context
  mood_detected TEXT, -- AI-detected mood during conversation
  topics TEXT[], -- Topics discussed
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_conversation_history ENABLE ROW LEVEL SECURITY;

-- Policies for ai_conversation_history
CREATE POLICY "Users can view their own conversations"
  ON ai_conversation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON ai_conversation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON ai_conversation_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON ai_conversation_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_ai_conversation_user ON ai_conversation_history(user_id, created_at DESC);
CREATE INDEX idx_ai_conversation_type ON ai_conversation_history(user_id, conversation_type);

-- ============================================
-- 4. LIFE TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS life_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('health', 'finance', 'home', 'vehicle', 'documents', 'insurance', 'subscriptions', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  recurrence_rule TEXT, -- 'yearly', 'monthly', 'quarterly', or iCal RRULE
  last_completed_at TIMESTAMPTZ,
  next_due_at DATE,
  reminder_days_before INTEGER[] DEFAULT ARRAY[7, 1],
  notes TEXT,
  attachments TEXT[], -- URLs to documents
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE life_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for life_tasks
CREATE POLICY "Users can view their own life tasks"
  ON life_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own life tasks"
  ON life_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life tasks"
  ON life_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life tasks"
  ON life_tasks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_life_tasks_user ON life_tasks(user_id, is_active);
CREATE INDEX idx_life_tasks_due ON life_tasks(user_id, next_due_at) WHERE is_active = TRUE;
CREATE INDEX idx_life_tasks_category ON life_tasks(user_id, category);

-- ============================================
-- 5. WELLNESS METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wellness_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  average_mood DECIMAL(3, 2),
  average_energy DECIMAL(3, 2),
  average_stress DECIMAL(3, 2),
  average_sleep DECIMAL(3, 2),
  checkin_count INTEGER DEFAULT 0,
  journal_word_count INTEGER DEFAULT 0,
  gratitude_count INTEGER DEFAULT 0,
  wins_count INTEGER DEFAULT 0,
  ai_weekly_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Enable RLS
ALTER TABLE wellness_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for wellness_metrics
CREATE POLICY "Users can view their own wellness metrics"
  ON wellness_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wellness metrics"
  ON wellness_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness metrics"
  ON wellness_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_wellness_metrics_user_date ON wellness_metrics(user_id, metric_date DESC);

-- ============================================
-- 6. APPLY UPDATE TRIGGERS
-- ============================================
CREATE TRIGGER update_personal_events_updated_at
  BEFORE UPDATE ON personal_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversation_history_updated_at
  BEFORE UPDATE ON ai_conversation_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_tasks_updated_at
  BEFORE UPDATE ON life_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_metrics_updated_at
  BEFORE UPDATE ON wellness_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Run this SQL in Supabase SQL Editor
-- ============================================
