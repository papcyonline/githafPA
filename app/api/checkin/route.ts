import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { format, subDays } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const type = searchParams.get('type') || 'morning'
    const history = searchParams.get('history')
    const days = parseInt(searchParams.get('days') || '7')

    if (history === 'true') {
      const fromDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .gte('checkin_date', fromDate)
        .order('checkin_date', { ascending: false })

      if (error) throw error
      return NextResponse.json({ checkins: data || [] })
    }

    if (date) {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('checkin_date', date)
        .eq('checkin_type', type)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return NextResponse.json({ checkin: data })
    }

    // Return today's check-in
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('checkin_date', today)
      .eq('checkin_type', type)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return NextResponse.json({ checkin: data })
  } catch (error: any) {
    console.error('Get checkin error:', error)
    // Return empty data if table doesn't exist
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return NextResponse.json({ checkin: null, checkins: [] })
    }
    return NextResponse.json({ checkin: null, checkins: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { generateResponse, ...checkinData } = body

    // Check if check-in already exists
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('checkin_date', checkinData.checkin_date)
      .eq('checkin_type', checkinData.checkin_type)
      .single()

    let result

    if (existing) {
      // Update existing check-in
      const { data, error } = await supabase
        .from('daily_checkins')
        .update(checkinData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new check-in
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert(checkinData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // Generate AI response if requested
    if (generateResponse) {
      try {
        const aiResponse = await generateAIResponse(result)

        // Update check-in with AI response
        const { data: updated, error: updateError } = await supabase
          .from('daily_checkins')
          .update({ ai_response: aiResponse })
          .eq('id', result.id)
          .select()
          .single()

        if (!updateError) {
          result = updated
        }
      } catch (aiError) {
        console.error('AI response generation failed:', aiError)
      }
    }

    return NextResponse.json({ checkin: result })
  } catch (error: any) {
    console.error('Submit checkin error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function generateAIResponse(checkin: any): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  })

  const prompt = buildCheckinPrompt(checkin)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a supportive personal wellness assistant. Respond warmly and empathetically to the user's daily check-in.
Provide encouragement, acknowledge their feelings, and offer brief, actionable suggestions if appropriate.
Keep your response concise (2-3 sentences) and positive.
Use a warm, conversational tone.`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 200,
  })

  return completion.choices[0]?.message?.content || "Thank you for checking in today. I hope you have a wonderful day!"
}

function buildCheckinPrompt(checkin: any): string {
  let prompt = `Here's my ${checkin.checkin_type} check-in:\n`

  if (checkin.mood_score) {
    const moods = ['very low', 'low', 'neutral', 'good', 'great']
    prompt += `- Mood: ${moods[checkin.mood_score - 1] || 'neutral'}\n`
  }

  if (checkin.energy_level) {
    const energy = ['exhausted', 'tired', 'okay', 'energetic', 'supercharged']
    prompt += `- Energy: ${energy[checkin.energy_level - 1] || 'okay'}\n`
  }

  if (checkin.stress_level) {
    const stress = ['calm', 'relaxed', 'mild stress', 'stressed', 'overwhelmed']
    prompt += `- Stress: ${stress[checkin.stress_level - 1] || 'mild'}\n`
  }

  if (checkin.gratitude_items?.length) {
    prompt += `- Grateful for: ${checkin.gratitude_items.join(', ')}\n`
  }

  if (checkin.wins?.length) {
    prompt += `- Today's wins: ${checkin.wins.join(', ')}\n`
  }

  if (checkin.challenges?.length) {
    prompt += `- Challenges: ${checkin.challenges.join(', ')}\n`
  }

  if (checkin.journal_entry) {
    prompt += `- Journal: ${checkin.journal_entry.substring(0, 200)}...\n`
  }

  return prompt
}
