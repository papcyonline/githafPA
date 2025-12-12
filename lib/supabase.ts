import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // During build time, return a dummy client that won't be used
      console.warn('Supabase environment variables not set, using placeholder')
      return {
        from: () => ({ select: () => ({ data: null, error: null }) }),
        auth: { getUser: () => ({ data: null, error: null }) }
      } as unknown as SupabaseClient
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

// Types matching the mobile app
export interface Recording {
  id: string
  user_id: string
  title: string
  audio_url: string
  duration: number
  file_size: number
  transcript?: string
  summary?: string
  key_points?: string[]
  folder_id?: string
  is_favorite: boolean
  is_pinned?: boolean
  tags?: string[]
  latitude?: number
  longitude?: number
  location_name?: string
  location_address?: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}
