import { supabase } from './supabase'

export interface DocumentTemplate {
  id: string
  user_id: string
  template_type: 'proposal' | 'report' | 'sop' | 'meeting_notes' | 'contract' | 'email'
  name: string
  description: string | null
  content: string
  variables: TemplateVariable[] | null
  is_default: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'date' | 'number' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
  default_value?: string
}

export interface GeneratedDocument {
  id: string
  user_id: string
  template_id: string | null
  document_type: string
  title: string
  content: string
  metadata: Record<string, unknown> | null
  recording_id: string | null
  event_id: string | null
  created_at: string
  updated_at: string
}

export interface MeetingFollowup {
  id: string
  user_id: string
  event_id: string | null
  recording_id: string | null
  attendees: string[] | null
  summary: string | null
  action_items: ActionItem[] | null
  key_decisions: Decision[] | null
  email_draft_id: string | null
  status: 'pending' | 'sent' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface ActionItem {
  assignee: string
  task: string
  due_date: string | null
}

export interface Decision {
  decision: string
  context: string | null
}

export const TEMPLATE_TYPES = {
  proposal: { label: 'Proposal', icon: '📋', description: 'Business proposals and project outlines' },
  report: { label: 'Report', icon: '📊', description: 'Status reports and summaries' },
  sop: { label: 'SOP', icon: '📖', description: 'Standard operating procedures' },
  meeting_notes: { label: 'Meeting Notes', icon: '📝', description: 'Meeting summaries and minutes' },
  contract: { label: 'Contract', icon: '📜', description: 'Agreements and contracts' },
  email: { label: 'Email', icon: '✉️', description: 'Email templates' },
}

export const documentsService = {
  // TEMPLATES
  async getTemplates(type?: DocumentTemplate['template_type']): Promise<DocumentTemplate[]> {
    let query = supabase
      .from('document_templates')
      .select('*')
      .order('name', { ascending: true })

    if (type) {
      query = query.eq('template_type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getTemplate(id: string): Promise<DocumentTemplate | null> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createTemplate(input: Omit<DocumentTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DocumentTemplate> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // GENERATED DOCUMENTS
  async getDocuments(options?: { type?: string; limit?: number }): Promise<GeneratedDocument[]> {
    let query = supabase
      .from('generated_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.type) {
      query = query.eq('document_type', options.type)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getDocument(id: string): Promise<GeneratedDocument | null> {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async generateDocument(
    templateId: string,
    variables: Record<string, string>,
    metadata?: Record<string, unknown>
  ): Promise<GeneratedDocument> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const template = await this.getTemplate(templateId)
    if (!template) throw new Error('Template not found')

    // Replace variables in template content
    let content = template.content
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    const title = variables.title || `${template.name} - ${new Date().toLocaleDateString()}`

    const { data, error } = await supabase
      .from('generated_documents')
      .insert({
        user_id: user.id,
        template_id: templateId,
        document_type: template.template_type,
        title,
        content,
        metadata: { ...metadata, variables },
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async saveDocument(input: Omit<GeneratedDocument, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<GeneratedDocument> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('generated_documents')
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateDocument(id: string, updates: Partial<GeneratedDocument>): Promise<GeneratedDocument> {
    const { data, error } = await supabase
      .from('generated_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('generated_documents')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // MEETING FOLLOW-UPS
  async getFollowups(status?: MeetingFollowup['status']): Promise<MeetingFollowup[]> {
    let query = supabase
      .from('meeting_followups')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async createFollowup(input: Omit<MeetingFollowup, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MeetingFollowup> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('meeting_followups')
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateFollowup(id: string, updates: Partial<MeetingFollowup>): Promise<MeetingFollowup> {
    const { data, error } = await supabase
      .from('meeting_followups')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // HELPER FUNCTIONS
  getTemplateTypeInfo(type: DocumentTemplate['template_type']) {
    return TEMPLATE_TYPES[type] || TEMPLATE_TYPES.report
  },

  extractVariables(content: string): string[] {
    const matches = content.match(/{{(\w+)}}/g) || []
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
  },

  // DEFAULT TEMPLATES
  getDefaultTemplates(): Partial<DocumentTemplate>[] {
    return [
      {
        template_type: 'meeting_notes',
        name: 'Standard Meeting Notes',
        description: 'Simple meeting notes template',
        content: `# Meeting: {{meeting_title}}

**Date:** {{date}}
**Attendees:** {{attendees}}

## Agenda
{{agenda}}

## Discussion Points
{{discussion}}

## Action Items
{{action_items}}

## Next Steps
{{next_steps}}
`,
        variables: [
          { name: 'meeting_title', label: 'Meeting Title', type: 'text', required: true },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'attendees', label: 'Attendees', type: 'text' },
          { name: 'agenda', label: 'Agenda', type: 'textarea' },
          { name: 'discussion', label: 'Discussion Points', type: 'textarea' },
          { name: 'action_items', label: 'Action Items', type: 'textarea' },
          { name: 'next_steps', label: 'Next Steps', type: 'textarea' },
        ],
        is_default: true,
      },
      {
        template_type: 'proposal',
        name: 'Project Proposal',
        description: 'Basic project proposal template',
        content: `# Project Proposal: {{project_name}}

**Prepared by:** {{author}}
**Date:** {{date}}

## Executive Summary
{{summary}}

## Objectives
{{objectives}}

## Scope
{{scope}}

## Timeline
{{timeline}}

## Budget
{{budget}}

## Conclusion
{{conclusion}}
`,
        variables: [
          { name: 'project_name', label: 'Project Name', type: 'text', required: true },
          { name: 'author', label: 'Author', type: 'text' },
          { name: 'date', label: 'Date', type: 'date' },
          { name: 'summary', label: 'Executive Summary', type: 'textarea' },
          { name: 'objectives', label: 'Objectives', type: 'textarea' },
          { name: 'scope', label: 'Scope', type: 'textarea' },
          { name: 'timeline', label: 'Timeline', type: 'textarea' },
          { name: 'budget', label: 'Budget', type: 'textarea' },
          { name: 'conclusion', label: 'Conclusion', type: 'textarea' },
        ],
        is_default: true,
      },
    ]
  },
}
