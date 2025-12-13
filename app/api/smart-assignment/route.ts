/**
 * Smart Assignment API Route
 * Handles research tasks - searches for information and saves to notes/reminders
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/api/openai'
import { createClient } from '@supabase/supabase-js'
import { withRateLimit, rateLimitConfigs } from '@/lib/api/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = withRateLimit(request, undefined, rateLimitConfigs.ai)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    const { query, saveAs, reminderDate, reminderTime, userId } = body

    if (!query || !saveAs || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: query, saveAs, userId' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS for this operation
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Step 1: Use AI to research and compile information
    const openai = getOpenAIClient()

    const researchPrompt = `You are a helpful research assistant. The user wants to find: "${query}"

Please provide a comprehensive but concise response that includes:
1. A summary of the best options/findings
2. Key details (prices, ratings, locations, etc. where applicable)
3. Any important tips or recommendations
4. Sources or where to find more information

Format your response in a clear, readable way that can be saved as a note.
Keep it informative but under 500 words.
Include specific recommendations with approximate prices where possible.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a knowledgeable research assistant that provides helpful, accurate information in a concise format.' },
        { role: 'user', content: researchPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const researchResult = completion.choices[0]?.message?.content || 'No results found.'

    // Step 2: Generate a title
    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate a concise title (max 50 chars) for this research. Return only the title, nothing else.' },
        { role: 'user', content: `Research query: ${query}` }
      ],
      temperature: 0.3,
      max_tokens: 50,
    })

    const title = titleCompletion.choices[0]?.message?.content?.trim() || `Research: ${query.substring(0, 40)}`

    // Step 3: Save based on user preference
    let resultId: string | null = null
    let resultType = saveAs

    if (saveAs === 'note') {
      // Create a note
      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title: title,
          content: `## ${title}\n\n${researchResult}\n\n---\n*Research completed on ${new Date().toLocaleDateString()}*`,
          tags: ['research', 'ai-generated'],
        })
        .select()
        .single()

      if (error) throw error
      resultId = note.id

    } else if (saveAs === 'reminder') {
      // Create a reminder
      const { data: reminder, error } = await supabase
        .from('reminders')
        .insert({
          user_id: userId,
          title: title,
          description: researchResult,
          reminder_date: reminderDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reminder_time: reminderTime || '09:00',
        })
        .select()
        .single()

      if (error) throw error
      resultId = reminder.id

    } else if (saveAs === 'task') {
      // Create a task
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: title,
          description: researchResult,
          priority: 'medium',
          source: 'ai_extracted',
        })
        .select()
        .single()

      if (error) throw error
      resultId = task.id
    }

    // Step 4: Log the assignment
    try {
      await supabase
        .from('smart_assignments')
        .insert({
          user_id: userId,
          query: query,
          status: 'completed',
          result_type: saveAs,
          result_id: resultId,
          research_data: researchResult,
          completed_at: new Date().toISOString(),
        })
    } catch {
      // Table might not exist, ignore
    }

    return NextResponse.json({
      success: true,
      message: `Research completed and saved as ${saveAs}`,
      result: {
        id: resultId,
        type: resultType,
        title: title,
        preview: researchResult.substring(0, 200) + '...',
      }
    })

  } catch (error) {
    console.error('Smart assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to complete research task' },
      { status: 500 }
    )
  }
}
