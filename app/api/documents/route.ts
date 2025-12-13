import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const resource = searchParams.get('resource') || 'documents' // 'documents' or 'templates'
    const limit = searchParams.get('limit')

    const table = resource === 'templates' ? 'document_templates' : 'generated_documents'

    let query = supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      const typeField = resource === 'templates' ? 'template_type' : 'document_type'
      query = query.eq(typeField, type)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ [resource]: data || [] })
  } catch (error: any) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resource, templateId, variables, ...data } = body

    if (resource === 'template') {
      // Create template
      const { data: template, error } = await supabase
        .from('document_templates')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ template })
    }

    if (templateId) {
      // Generate document from template
      const { data: template, error: templateError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError

      // Replace variables in template content
      let content = template.content
      for (const [key, value] of Object.entries(variables || {})) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string)
      }

      const title = (variables as any)?.title || `${template.name} - ${new Date().toLocaleDateString()}`

      const { data: document, error } = await supabase
        .from('generated_documents')
        .insert({
          ...data,
          template_id: templateId,
          document_type: template.template_type,
          title,
          content,
          metadata: { variables },
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ document })
    }

    // Create document directly
    const { data: document, error } = await supabase
      .from('generated_documents')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ document })
  } catch (error: any) {
    console.error('Create document error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, resource, ...updates } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const table = resource === 'template' ? 'document_templates' : 'generated_documents'

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ [resource === 'template' ? 'template' : 'document']: data })
  } catch (error: any) {
    console.error('Update document error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const resource = searchParams.get('resource') || 'document'

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const table = resource === 'template' ? 'document_templates' : 'generated_documents'

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
