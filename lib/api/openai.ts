/**
 * OpenAI Service - Server-side only
 * Single Responsibility: Handle all OpenAI API interactions
 *
 * SECURITY: This module should ONLY be imported in server-side code (API routes)
 * Never import this in client components or pages
 */

import OpenAI from 'openai'

// Singleton pattern for OpenAI client
let openaiInstance: OpenAI | null = null

/**
 * Get the OpenAI client instance (singleton)
 * Uses server-side environment variable only
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    openaiInstance = new OpenAI({ apiKey })
  }

  return openaiInstance
}

/**
 * Transcribe audio using Whisper API
 */
export async function transcribeAudio(
  audioBlob: Blob,
  options: {
    language?: string
    filename?: string
  } = {}
): Promise<string> {
  const openai = getOpenAIClient()
  const { language = 'en', filename = 'audio.webm' } = options

  const audioFile = new File([audioBlob], filename, { type: audioBlob.type || 'audio/webm' })

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language,
  })

  return transcription.text
}

/**
 * Parse voice command into structured action
 */
export async function parseVoiceCommand(
  transcript: string,
  context?: string
): Promise<ParsedCommand> {
  const openai = getOpenAIClient()
  const today = new Date().toISOString().split('T')[0]

  const { systemPrompt, typeOptions } = buildContextPrompt(context, today)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: transcript }
    ],
    temperature: 0.3,
  })

  const content = response.choices[0]?.message?.content || '{}'

  return parseAIResponse(content, transcript)
}

/**
 * Generate AI response for chat
 */
export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  systemContext?: string
): Promise<string> {
  const openai = getOpenAIClient()

  const allMessages = systemContext
    ? [{ role: 'system' as const, content: systemContext }, ...messages]
    : messages

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: allMessages,
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content || ''
}

// Types
export interface ParsedCommand {
  type: string
  title: string
  description?: string
  date?: string
  time?: string
  priority?: 'low' | 'medium' | 'high'
  amount?: number
  category?: string
  entry_type?: 'income' | 'expense'
  mood_score?: number
  energy_level?: number
  stress_level?: number
  recurrence?: string
}

// Helper functions (private)
function buildContextPrompt(context: string | undefined, today: string): { systemPrompt: string; typeOptions: string } {
  let contextInstructions = ''
  let typeOptions = '"reminder" | "task" | "note" | "event"'

  switch (context) {
    case 'finance':
      contextInstructions = 'The user is in the Finance section. Focus on extracting financial information.'
      typeOptions = '"finance_expense" | "finance_income" | "finance_transfer" | "finance_investment"'
      break
    case 'documents':
      contextInstructions = 'The user is in the Documents section. Focus on document creation requests.'
      typeOptions = '"document_proposal" | "document_report" | "document_sop" | "document_meeting" | "document_contract"'
      break
    case 'checkin':
      contextInstructions = 'The user is doing a daily check-in. Extract mood, energy, stress, and well-being information.'
      typeOptions = '"checkin"'
      break
    case 'personal':
      contextInstructions = 'The user is adding a personal event. Extract event details.'
      typeOptions = '"personal_event"'
      break
    case 'life-tasks':
      contextInstructions = 'The user is adding a life task (like insurance, appointments, etc.). Extract task details.'
      typeOptions = '"life_task"'
      break
  }

  const systemPrompt = `You are a personal assistant that parses voice commands into structured actions.
Today's date is ${today}.
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

${context === 'finance' ? '- amount: The transaction amount\n- category: Expense category\n- entry_type: "expense" | "income"' : ''}
${context === 'checkin' ? '- mood_score: 1-5 rating\n- energy_level: 1-5 rating\n- stress_level: 1-5 rating' : ''}
${context === 'life-tasks' ? '- category: "health" | "finance" | "home" | "vehicle" | "documents" | "insurance"\n- recurrence: "monthly" | "quarterly" | "yearly"' : ''}

Only return valid JSON, no markdown.`

  return { systemPrompt, typeOptions }
}

function parseAIResponse(content: string, transcript: string): ParsedCommand {
  try {
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleanContent)
  } catch {
    return {
      type: 'note',
      title: transcript.substring(0, 50),
      description: transcript,
    }
  }
}
