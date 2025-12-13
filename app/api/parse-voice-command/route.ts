import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { transcript, context } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Build context-specific instructions
    let contextInstructions = ''
    let typeOptions = '"reminder" | "task" | "note" | "event"'

    if (context === 'finance') {
      contextInstructions = `The user is in the Finance section. Focus on extracting financial information.`
      typeOptions = '"finance_expense" | "finance_income" | "finance_transfer" | "finance_investment"'
    } else if (context === 'documents') {
      contextInstructions = `The user is in the Documents section. Focus on document creation requests.`
      typeOptions = '"document_proposal" | "document_report" | "document_sop" | "document_meeting" | "document_contract"'
    } else if (context === 'checkin') {
      contextInstructions = `The user is doing a daily check-in. Extract mood, energy, stress, and well-being information.`
      typeOptions = '"checkin"'
    } else if (context === 'personal') {
      contextInstructions = `The user is adding a personal event. Extract event details.`
      typeOptions = '"personal_event"'
    } else if (context === 'life-tasks') {
      contextInstructions = `The user is adding a life task (like insurance, appointments, etc.). Extract task details.`
      typeOptions = '"life_task"'
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a personal assistant that parses voice commands into structured actions.
Today's date is ${todayStr}.
${contextInstructions}

Parse the user's voice command and return a JSON object with:
- type: ${typeOptions} | "reminder" | "task" | "note" | "event" | "none"
- title: A concise title for the item (max 50 chars)
- description: Any additional details
- date: The date in YYYY-MM-DD format (parse "tomorrow", "next monday", etc.)
- time: The time in HH:MM format (24-hour). Default to "09:00" if not specified.
- priority: "low" | "medium" | "high" for tasks
- amount: Numeric amount (for finance entries)
- category: Category name (for finance, life-tasks, etc.)

Context-specific fields:
${context === 'finance' ? '- amount: The transaction amount\n- category: Expense category (e.g., "Food & Dining", "Transportation")\n- entry_type: "expense" | "income"' : ''}
${context === 'checkin' ? '- mood_score: 1-5 rating\n- energy_level: 1-5 rating\n- stress_level: 1-5 rating' : ''}
${context === 'life-tasks' ? '- category: "health" | "finance" | "home" | "vehicle" | "documents" | "insurance"\n- recurrence: "monthly" | "quarterly" | "yearly"' : ''}

Examples:
${context === 'finance' ? '- "Spent $50 on dinner" → type: finance_expense, amount: 50, category: "Food & Dining"' : ''}
${context === 'checkin' ? '- "Feeling great today, lots of energy" → type: checkin, mood_score: 5, energy_level: 5' : ''}
${!context ? '- "Remind me to call John tomorrow at 3pm" → reminder, date=tomorrow, time=15:00' : ''}

Only return valid JSON, no markdown.`
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content || '{}'

    // Parse the JSON response
    let parsed
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleanContent)
    } catch {
      // If parsing fails, default to a note
      parsed = {
        type: 'note',
        title: transcript.substring(0, 50),
        description: transcript,
      }
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse command', details: error.message },
      { status: 500 }
    )
  }
}
