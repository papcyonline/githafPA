import { supabase } from './supabase'
import { format, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns'

export interface DailyCheckin {
  id: string
  user_id: string
  checkin_type: 'morning' | 'midday' | 'evening' | 'custom'
  checkin_date: string
  mood_score: number | null
  energy_level: number | null
  stress_level: number | null
  sleep_quality: number | null
  gratitude_items: string[] | null
  wins: string[] | null
  challenges: string[] | null
  tomorrow_priorities: string[] | null
  journal_entry: string | null
  ai_response: string | null
  ai_insights: Record<string, unknown> | null
  created_at: string
}

export interface CheckinTrends {
  averageMood: number
  averageEnergy: number
  averageStress: number
  averageSleep: number
  moodTrend: { date: string; score: number }[]
  topGratitudeThemes: string[]
  commonWins: string[]
  recurringChallenges: string[]
  weeklyInsight: string | null
}

export const checkinService = {
  async getCheckin(date: string, type: DailyCheckin['checkin_type'] = 'morning'): Promise<DailyCheckin | null> {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('checkin_date', date)
      .eq('checkin_type', type)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getTodayCheckin(type: DailyCheckin['checkin_type'] = 'morning'): Promise<DailyCheckin | null> {
    const today = format(new Date(), 'yyyy-MM-dd')
    return this.getCheckin(today, type)
  },

  async getHistory(days: number = 7): Promise<DailyCheckin[]> {
    const fromDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .gte('checkin_date', fromDate)
      .order('checkin_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async submitCheckin(input: Omit<DailyCheckin, 'id' | 'user_id' | 'created_at'>): Promise<DailyCheckin> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if check-in already exists for this date/type
    const existing = await this.getCheckin(input.checkin_date, input.checkin_type)

    if (existing) {
      // Update existing check-in
      const { data, error } = await supabase
        .from('daily_checkins')
        .update({
          ...input,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new check-in
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  async getTrends(days: number = 30): Promise<CheckinTrends> {
    const checkins = await this.getHistory(days)

    if (!checkins.length) {
      return {
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        averageSleep: 0,
        moodTrend: [],
        topGratitudeThemes: [],
        commonWins: [],
        recurringChallenges: [],
        weeklyInsight: null,
      }
    }

    // Calculate averages
    const moodScores = checkins.filter(c => c.mood_score).map(c => c.mood_score!)
    const energyLevels = checkins.filter(c => c.energy_level).map(c => c.energy_level!)
    const stressLevels = checkins.filter(c => c.stress_level).map(c => c.stress_level!)
    const sleepQualities = checkins.filter(c => c.sleep_quality).map(c => c.sleep_quality!)

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    // Build mood trend
    const moodTrend = checkins
      .filter(c => c.mood_score)
      .map(c => ({ date: c.checkin_date, score: c.mood_score! }))
      .reverse()

    // Collect gratitude, wins, challenges
    const allGratitude = checkins.flatMap(c => c.gratitude_items || [])
    const allWins = checkins.flatMap(c => c.wins || [])
    const allChallenges = checkins.flatMap(c => c.challenges || [])

    // Simple frequency analysis
    const topGratitudeThemes = this.getTopItems(allGratitude, 5)
    const commonWins = this.getTopItems(allWins, 5)
    const recurringChallenges = this.getTopItems(allChallenges, 5)

    // Generate weekly insight
    const weeklyInsight = this.generateWeeklyInsight(checkins)

    return {
      averageMood: Math.round(avg(moodScores) * 10) / 10,
      averageEnergy: Math.round(avg(energyLevels) * 10) / 10,
      averageStress: Math.round(avg(stressLevels) * 10) / 10,
      averageSleep: Math.round(avg(sleepQualities) * 10) / 10,
      moodTrend,
      topGratitudeThemes,
      commonWins,
      recurringChallenges,
      weeklyInsight,
    }
  },

  getTopItems(items: string[], limit: number): string[] {
    const counts: Record<string, number> = {}
    items.forEach(item => {
      const key = item.toLowerCase().trim()
      counts[key] = (counts[key] || 0) + 1
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item)
  },

  generateWeeklyInsight(checkins: DailyCheckin[]): string | null {
    if (checkins.length < 3) return null

    const avgMood = checkins.filter(c => c.mood_score).reduce((sum, c) => sum + c.mood_score!, 0) / checkins.length
    const avgStress = checkins.filter(c => c.stress_level).reduce((sum, c) => sum + c.stress_level!, 0) / checkins.length

    if (avgMood >= 4) {
      return "You've been in great spirits! Keep up whatever you're doing."
    } else if (avgMood <= 2) {
      return "It's been a challenging week. Remember to take care of yourself."
    } else if (avgStress >= 4) {
      return "Your stress levels have been elevated. Consider taking some time to decompress."
    }

    return "You're maintaining a balanced week. Small wins add up!"
  },

  getMoodEmoji(score: number): string {
    const emojis = ['😢', '😔', '😐', '🙂', '😊']
    return emojis[Math.min(score - 1, 4)] || '😐'
  },

  getEnergyEmoji(level: number): string {
    const emojis = ['😴', '🥱', '😌', '⚡', '🔥']
    return emojis[Math.min(level - 1, 4)] || '😌'
  },

  getStressEmoji(level: number): string {
    const emojis = ['😌', '🙂', '😐', '😰', '🤯']
    return emojis[Math.min(level - 1, 4)] || '😐'
  },

  getSleepEmoji(quality: number): string {
    const emojis = ['😫', '😪', '😴', '💤', '🌟']
    return emojis[Math.min(quality - 1, 4)] || '😴'
  },

  getScoreLabel(score: number, type: 'mood' | 'energy' | 'stress' | 'sleep'): string {
    const labels: Record<string, string[]> = {
      mood: ['Very Low', 'Low', 'Neutral', 'Good', 'Great'],
      energy: ['Exhausted', 'Tired', 'Okay', 'Energetic', 'Supercharged'],
      stress: ['Calm', 'Relaxed', 'Mild', 'Stressed', 'Overwhelmed'],
      sleep: ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'],
    }
    return labels[type][Math.min(score - 1, 4)] || labels[type][2]
  },
}
