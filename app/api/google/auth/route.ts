import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-calendar.service'

export async function GET() {
  try {
    const authUrl = getAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error: any) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL', details: error.message },
      { status: 500 }
    )
  }
}
