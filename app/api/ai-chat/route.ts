import { NextRequest, NextResponse } from 'next/server'
import { getLocalChatResponse } from '@/lib/local-chatbot'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get the latest user message
    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage?.content || ''

    // Generate response using local chatbot (no external API calls)
    const response = getLocalChatResponse(userMessage)

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Chat Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
