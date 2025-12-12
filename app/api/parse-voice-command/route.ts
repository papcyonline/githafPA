import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a personal assistant that parses voice commands into structured actions.
Today's date is ${todayStr}.

Parse the user's voice command and return a JSON object with:
- type: "reminder" | "task" | "note" | "event" | "none"
- title: A concise title for the item (max 50 chars)
- description: Any additional details
- date: The date in YYYY-MM-DD format (parse "tomorrow", "next monday", etc.)
- time: The time in HH:MM format (24-hour). Default to "09:00" if not specified.
- priority: "low" | "medium" | "high" for tasks

Examples:
- "Remind me to call John tomorrow at 3pm" → reminder, date=tomorrow, time=15:00
- "Book a meeting with Sarah next Monday" → event, date=next monday
- "I need to buy groceries" → task
- "Note to self: the password is 1234" → note

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
