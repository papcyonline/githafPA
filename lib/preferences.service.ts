import { supabase } from './supabase'

export interface UserPreferences {
  id: string
  user_id: string
  timezone: string
  morning_briefing_time: string
  morning_briefing_enabled: boolean
  weather_location: string | null
  weather_lat: number | null
  weather_lng: number | null
  theme: string
  default_calendar_view: 'day' | 'week' | 'month'
  created_at: string
  updated_at: string
}

export interface UpdatePreferencesInput {
  timezone?: string
  morning_briefing_time?: string
  morning_briefing_enabled?: boolean
  weather_location?: string
  weather_lat?: number
  weather_lng?: number
  theme?: string
  default_calendar_view?: 'day' | 'week' | 'month'
}

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  morning_briefing_time: '08:00',
  morning_briefing_enabled: true,
  weather_location: null,
  weather_lat: null,
  weather_lng: null,
  theme: 'dark',
  default_calendar_view: 'month',
}

export const preferencesService = {
  async getPreferences(): Promise<UserPreferences> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, create defaults
        return this.createDefaultPreferences()
      }
      throw error
    }

    return data
  },

  async createDefaultPreferences(): Promise<UserPreferences> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        ...DEFAULT_PREFERENCES,
      })
      .select()
      .single()

    if (error) {
      // If already exists (race condition), just fetch it
      if (error.code === '23505') {
        return this.getPreferences()
      }
      throw error
    }

    return data
  },

  async updatePreferences(input: UpdatePreferencesInput): Promise<UserPreferences> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // First ensure preferences exist
    await this.getPreferences()

    const { data, error } = await supabase
      .from('user_preferences')
      .update(input)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async setTimezone(timezone: string): Promise<UserPreferences> {
    return this.updatePreferences({ timezone })
  },

  async setMorningBriefing(enabled: boolean, time?: string): Promise<UserPreferences> {
    const updates: UpdatePreferencesInput = { morning_briefing_enabled: enabled }
    if (time) updates.morning_briefing_time = time
    return this.updatePreferences(updates)
  },

  async setWeatherLocation(location: string, lat?: number, lng?: number): Promise<UserPreferences> {
    return this.updatePreferences({
      weather_location: location,
      weather_lat: lat,
      weather_lng: lng,
    })
  },

  async setTheme(theme: string): Promise<UserPreferences> {
    return this.updatePreferences({ theme })
  },

  async setDefaultCalendarView(view: 'day' | 'week' | 'month'): Promise<UserPreferences> {
    return this.updatePreferences({ default_calendar_view: view })
  },

  async resetToDefaults(): Promise<UserPreferences> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_preferences')
      .update(DEFAULT_PREFERENCES)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Helper to get user's timezone-aware current time
  getCurrentTime(preferences: UserPreferences): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: preferences.timezone }))
  },

  // Check if it's morning briefing time
  isMorningBriefingTime(preferences: UserPreferences): boolean {
    if (!preferences.morning_briefing_enabled) return false

    const now = this.getCurrentTime(preferences)
    const [hours, minutes] = preferences.morning_briefing_time.split(':').map(Number)
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()

    // Within 30-minute window of briefing time
    const briefingMinutes = hours * 60 + minutes
    const currentTotalMinutes = currentHours * 60 + currentMinutes

    return Math.abs(currentTotalMinutes - briefingMinutes) <= 30
  },

  // Get available timezones for dropdown
  getAvailableTimezones(): string[] {
    return Intl.supportedValuesOf('timeZone')
  },
}
