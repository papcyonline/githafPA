import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
