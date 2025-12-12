'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase, Recording } from '@/lib/supabase'
import AudioRecorder from '@/components/AudioRecorder'
import FloatingAIChat from '@/components/FloatingAIChat'

export default function RecordingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecorder, setShowRecorder] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [playbackPosition, setPlaybackPosition] = useState<{ [key: string]: number }>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchRecordings()
    }
  }, [user, authLoading, router])

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecordings(data || [])
    } catch (error) {
      console.error('Error fetching recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlayPause = (recordingId: string, audioUrl: string) => {
    if (currentlyPlaying === recordingId) {
      if (audioRef.current) audioRef.current.pause()
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) audioRef.current.pause()
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setCurrentlyPlaying(recordingId)

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setPlaybackPosition(prev => ({ ...prev, [recordingId]: audioRef.current!.currentTime }))
        }
      }
      audioRef.current.onended = () => {
        setCurrentlyPlaying(null)
        setPlaybackPosition(prev => ({ ...prev, [recordingId]: 0 }))
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const deleteRecording = async (recordingId: string) => {
    if (!confirm('Delete this recording?')) return
    try {
      await supabase.from('recordings').delete().eq('id', recordingId)
      setRecordings(recordings.filter(r => r.id !== recordingId))
    } catch (error) {
      console.error('Error deleting recording:', error)
    }
  }

  const filteredRecordings = recordings.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.transcript?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <img src="/logo.png" alt="MeetAI" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-black">MeetAI</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/reminders" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Reminders</span>
            </Link>

            <Link href="/notes" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Notes</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</p>
            </div>

            <Link href="/recordings" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#A855F7]/10 text-[#A855F7] font-semibold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Recordings</span>
            </Link>

            <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-[#A855F7] flex items-center justify-center font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full mt-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-lg">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-black">Recordings</h1>
            <span className="text-sm text-gray-400">({filteredRecordings.length})</span>
          </div>

          <button
            onClick={() => setShowRecorder(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-2.5 rounded-full font-semibold transition-all inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Record</span>
          </button>
        </header>

        {/* Search */}
        <div className="px-6 py-3 border-b border-white/10">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A855F7] placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-20 h-20 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <h3 className="text-2xl font-bold mb-2">No recordings yet</h3>
              <p className="text-gray-400 mb-6">Record your first voice note</p>
              <button onClick={() => setShowRecorder(true)} className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all">
                Start Recording
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {filteredRecordings.map((recording) => {
                const isPlaying = currentlyPlaying === recording.id
                const progress = playbackPosition[recording.id] || 0
                const progressPercent = recording.duration > 0 ? (progress / recording.duration) * 100 : 0

                return (
                  <div key={recording.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900 transition-all group">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => togglePlayPause(recording.id, recording.audio_url)}
                        className="w-12 h-12 flex-shrink-0 rounded-full bg-[#A855F7] hover:bg-[#9333EA] flex items-center justify-center transition-all"
                      >
                        {isPlaying ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <Link href={`/recording/${recording.id}`} className="block hover:text-[#A855F7] transition-colors">
                          <h3 className="font-semibold truncate">{recording.title}</h3>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2 mb-2">
                            <div className="h-full bg-[#A855F7] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{formatDuration(recording.duration)}</span>
                            <span>{formatDate(recording.created_at)}</span>
                            {recording.transcript && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">Transcribed</span>
                            )}
                          </div>
                          {recording.transcript && (
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{recording.transcript}</p>
                          )}
                        </Link>
                      </div>

                      <button
                        onClick={() => deleteRecording(recording.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showRecorder && (
        <AudioRecorder onClose={() => setShowRecorder(false)} onRecordingComplete={fetchRecordings} />
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <FloatingAIChat />
    </div>
  )
}
