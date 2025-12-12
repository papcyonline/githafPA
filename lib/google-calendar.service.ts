import { google } from 'googleapis'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
  )
}

export const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client()
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar'
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })
}

export const getTokensFromCode = async (code: string) => {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export const addEventToCalendar = async (
  accessToken: string,
  refreshToken: string,
  event: {
    title: string
    description?: string
    date: string
    time: string
    duration?: number // in minutes, default 30
  }
) => {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const startDateTime = new Date(`${event.date}T${event.time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + (event.duration || 30) * 60000)

  const calendarEvent = {
    summary: event.title,
    description: event.description || '',
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
        { method: 'popup', minutes: 30 }
      ]
    }
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: calendarEvent
  })

  return response.data
}

export const refreshAccessToken = async (refreshToken: string) => {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })

  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials
}
