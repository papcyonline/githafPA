import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/google-calendar.service'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // user_id passed from frontend

    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=no_code', request.url))
    }

    const tokens = await getTokensFromCode(code)

    // Store tokens in database if we have a user ID
    if (state) {
      const supabaseAdmin = getSupabaseAdmin()
      await supabaseAdmin
        .from('user_google_tokens')
        .upsert({
          user_id: state,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
    }

    // Redirect back to settings page with success
    return NextResponse.redirect(new URL('/settings?google_connected=true', request.url))
  } catch (error: any) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(new URL('/settings?error=auth_failed', request.url))
  }
}
