/**
 * Smart Assignment API Route
 * Handles research tasks - uses AI to research topics
 * The client handles saving to database (with user auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/api/openai'
import { withRateLimit, rateLimitConfigs } from '@/lib/api/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = withRateLimit(request, undefined, rateLimitConfigs.ai)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    const { query, saveAs } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required field: query' },
        { status: 400 }
      )
    }

    // Use AI to research and compile information
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

    // Generate a title
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

    // Return research results - client will save to database
    return NextResponse.json({
      success: true,
      title: title,
      content: researchResult,
      query: query,
      saveAs: saveAs || 'note',
    })

  } catch (error: any) {
    console.error('Smart assignment error:', error)
    const errorMessage = error?.message || 'Failed to complete research task'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
