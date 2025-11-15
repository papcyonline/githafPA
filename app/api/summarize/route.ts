import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    // Generate summary using GPT-4
    const summaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes meeting transcripts. Provide a concise, clear summary of the main points discussed.'
        },
        {
          role: 'user',
          content: `Please summarize this transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
    })

    const summary = summaryCompletion.choices[0]?.message?.content || ''

    // Extract key points
    const keyPointsCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts key points from meeting transcripts. Return a JSON array of strings, with each string being a key point. Return only the JSON array, no other text.'
        },
        {
          role: 'user',
          content: `Extract 3-5 key points from this transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.5,
      max_tokens: 300,
    })

    let keyPoints: string[] = []
    try {
      const keyPointsText = keyPointsCompletion.choices[0]?.message?.content || '[]'
      keyPoints = JSON.parse(keyPointsText)
    } catch (e) {
      // If JSON parsing fails, try to extract bullet points
      const keyPointsText = keyPointsCompletion.choices[0]?.message?.content || ''
      keyPoints = keyPointsText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 5)
    }

    return NextResponse.json({
      summary,
      keyPoints,
    })
  } catch (error: any) {
    console.error('Summarization error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    )
  }
}
