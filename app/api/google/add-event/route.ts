import { NextRequest, NextResponse } from 'next/server'
import { addEventToCalendar, refreshAccessToken } from '@/lib/google-calendar.service'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, reminder } = await request.json()

    if (!userId || !reminder) {
      return NextResponse.json(
        { error: 'User ID and reminder are required' },
        { status: 400 }
      )
    }

    // Get user's Google tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google Calendar not connected', needsAuth: true },
        { status: 401 }
      )
    }

    let accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token

    // Check if token is expired and refresh if needed
    if (tokenData.expiry_date && new Date(tokenData.expiry_date) < new Date()) {
      try {
        const newCredentials = await refreshAccessToken(refreshToken)
        accessToken = newCredentials.access_token!

        // Update stored tokens
        await supabaseAdmin
          .from('user_google_tokens')
          .update({
            access_token: newCredentials.access_token,
            expiry_date: newCredentials.expiry_date,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      } catch (refreshError) {
        return NextResponse.json(
          { error: 'Token expired, please reconnect Google Calendar', needsAuth: true },
          { status: 401 }
        )
      }
    }

    // Add event to Google Calendar
    const event = await addEventToCalendar(accessToken, refreshToken, {
      title: reminder.title,
      description: reminder.description || '',
      date: reminder.reminder_date,
      time: reminder.reminder_time || '09:00',
      duration: 30
    })

    // Update reminder to mark it as synced
    await supabaseAdmin
      .from('reminders')
      .update({
        google_event_id: event.id,
        synced_to_google: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminder.id)

    return NextResponse.json({
      success: true,
      eventId: event.id,
      eventLink: event.htmlLink
    })
  } catch (error: any) {
    console.error('Add to calendar error:', error)
    return NextResponse.json(
      { error: 'Failed to add to calendar', details: error.message },
      { status: 500 }
    )
  }
}
