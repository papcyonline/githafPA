'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase, Recording } from '@/lib/supabase'
import AudioRecorder from '@/components/AudioRecorder'
import DashboardLayout from '@/components/DashboardLayout'

export default function RecordingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecorder, setShowRecorder] = useState(false)
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

  // Listen for global recording complete events
  useEffect(() => {
    const handleRecordingComplete = () => {
      fetchRecordings()
    }
    window.addEventListener('recording-complete', handleRecordingComplete)
    return () => window.removeEventListener('recording-complete', handleRecordingComplete)
  }, [user])

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
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">Recordings</h1>
            <span className="text-sm text-gray-400">({filteredRecordings.length})</span>
          </div>
          <button
            onClick={() => setShowRecorder(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold transition-all inline-flex items-center space-x-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Record</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
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

        <div>
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

      {showRecorder && (
        <AudioRecorder onClose={() => setShowRecorder(false)} onRecordingComplete={fetchRecordings} />
      )}
      </div>
    </DashboardLayout>
  )
}
