-- Executive Productivity Tables
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. EMAIL ACCOUNTS TABLE (Gmail Integration)
-- ============================================
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gmail',
  email_address TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  is_primary BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email_address)
);

-- Enable RLS
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for email_accounts
CREATE POLICY "Users can view their own email accounts"
  ON email_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email accounts"
  ON email_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email accounts"
  ON email_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email accounts"
  ON email_accounts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_email_accounts_user ON email_accounts(user_id);

-- ============================================
-- 2. EMAIL CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
  gmail_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  sender_email TEXT,
  sender_name TEXT,
  snippet TEXT,
  body_preview TEXT,
  labels TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  ai_priority TEXT CHECK (ai_priority IN ('high', 'medium', 'low')),
  ai_category TEXT CHECK (ai_category IN ('action_required', 'fyi', 'promotional', 'personal', 'newsletter')),
  ai_summary TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email_account_id, gmail_id)
);

-- Enable RLS
ALTER TABLE email_cache ENABLE ROW LEVEL SECURITY;

-- Policies for email_cache
CREATE POLICY "Users can view their own cached emails"
  ON email_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cached emails"
  ON email_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cached emails"
  ON email_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cached emails"
  ON email_cache FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_email_cache_user ON email_cache(user_id, received_at DESC);
CREATE INDEX idx_email_cache_account ON email_cache(email_account_id, received_at DESC);
CREATE INDEX idx_email_cache_category ON email_cache(user_id, ai_category);

-- ============================================
-- 3. EMAIL DRAFTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID REFERENCES email_accounts(id),
  reply_to_id TEXT, -- gmail_id if replying
  to_addresses TEXT[],
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  subject TEXT,
  body TEXT,
  ai_suggested BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

-- Policies for email_drafts
CREATE POLICY "Users can view their own email drafts"
  ON email_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email drafts"
  ON email_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email drafts"
  ON email_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email drafts"
  ON email_drafts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_email_drafts_user ON email_drafts(user_id, created_at DESC);
CREATE INDEX idx_email_drafts_status ON email_drafts(user_id, status);

-- ============================================
-- 4. DOCUMENT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL, -- 'proposal', 'report', 'sop', 'meeting_notes', 'contract', 'email'
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables JSONB, -- [{name: 'client_name', label: 'Client Name', type: 'text'}]
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Policies for document_templates
CREATE POLICY "Users can view their own and public templates"
  ON document_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own templates"
  ON document_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON document_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON document_templates FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_document_templates_user ON document_templates(user_id);
CREATE INDEX idx_document_templates_type ON document_templates(template_type);

-- ============================================
-- 5. GENERATED DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES document_templates(id),
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  recording_id UUID REFERENCES recordings(id) ON DELETE SET NULL,
  event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Policies for generated_documents
CREATE POLICY "Users can view their own documents"
  ON generated_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON generated_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON generated_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON generated_documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_generated_documents_user ON generated_documents(user_id, created_at DESC);
CREATE INDEX idx_generated_documents_type ON generated_documents(user_id, document_type);

-- ============================================
-- 6. MEETING FOLLOW-UPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meeting_followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
  recording_id UUID REFERENCES recordings(id) ON DELETE SET NULL,
  attendees TEXT[],
  summary TEXT,
  action_items JSONB, -- [{assignee: 'John', task: 'Review proposal', due_date: '2024-01-15'}]
  key_decisions JSONB, -- [{decision: 'Approved budget', context: '...'}]
  email_draft_id UUID REFERENCES email_drafts(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meeting_followups ENABLE ROW LEVEL SECURITY;

-- Policies for meeting_followups
CREATE POLICY "Users can view their own meeting follow-ups"
  ON meeting_followups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting follow-ups"
  ON meeting_followups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting follow-ups"
  ON meeting_followups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting follow-ups"
  ON meeting_followups FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_meeting_followups_user ON meeting_followups(user_id, created_at DESC);
CREATE INDEX idx_meeting_followups_event ON meeting_followups(event_id);

-- ============================================
-- 7. APPLY UPDATE TRIGGERS
-- ============================================
CREATE TRIGGER update_email_accounts_updated_at
  BEFORE UPDATE ON email_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_drafts_updated_at
  BEFORE UPDATE ON email_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_followups_updated_at
  BEFORE UPDATE ON meeting_followups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Run this SQL in Supabase SQL Editor
-- ============================================
