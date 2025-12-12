'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth-context'
import { supabase, Recording } from '../../../lib/supabase'
import { notesService, remindersService, tasksService } from '../../../lib/notes.service'

export default function RecordingDetail() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const audioRef = useRef<HTMLAudioElement>(null)

  // State
  const [recording, setRecording] = useState<Recording | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)

  // Modals
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [moreModalOpen, setMoreModalOpen] = useState(false)
  const [aiResultModal, setAiResultModal] = useState(false)
  const [saveAsModalOpen, setSaveAsModalOpen] = useState(false)
  const [editTitleModal, setEditTitleModal] = useState(false)
  const [tagModalOpen, setTagModalOpen] = useState(false)

  // AI Processing
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiResult, setAiResult] = useState('')

  // Tags
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  // Edit title
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && params.id) {
      fetchRecording()
    }
  }, [user, authLoading, params.id, router])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const fetchRecording = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setRecording(data)
      setTags(data.tags || [])
      setEditTitle(data.title)
    } catch (error) {
      console.error('Error fetching recording:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = parseFloat(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
  }

  const handleAiAction = async (action: string) => {
    if (!recording?.transcript) {
      alert('No transcript available. Please generate transcript first.')
      return
    }

    setAiModalOpen(false)
    setAiProcessing(true)

    try {
      let prompt = ''
      switch (action) {
        case 'summary':
          prompt = `Please provide a concise summary (3-5 sentences) of the following transcript:\n\n${recording.transcript}`
          break
        case 'todo':
          prompt = `Extract all action items and create a to-do list from the following transcript. Format as a bulleted list:\n\n${recording.transcript}`
          break
        case 'points':
          prompt = `Extract the main points from the following transcript. Format as a bulleted list of key takeaways:\n\n${recording.transcript}`
          break
        case 'translate':
          prompt = `Translate the following transcript to Spanish:\n\n${recording.transcript}`
          break
      }

      console.log('Making AI request for action:', action)

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that analyzes meeting recordings and transcripts.'
            },
            { role: 'user', content: prompt }
          ]
        })
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`AI request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('AI response received:', data)

      if (!data.response) {
        throw new Error('No response data from AI')
      }

      setAiResult(data.response)
      setAiResultModal(true)
    } catch (error: any) {
      console.error('AI Action error:', error)
      alert(`Failed to process AI request: ${error.message || 'Unknown error'}`)
    } finally {
      setAiProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleSaveAs = async (type: 'note' | 'reminder' | 'task') => {
    setSaveAsModalOpen(false)
    setAiResultModal(false)

    const title = `AI Analysis - ${recording?.title || 'Recording'}`

    try {
      if (type === 'note') {
        await notesService.createNote(title, aiResult)
        alert('Saved as note! Check the Notes page to view it.')
      } else if (type === 'reminder') {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateStr = tomorrow.toISOString().split('T')[0]
        const timeStr = '09:00'
        await remindersService.createReminder(title, aiResult, dateStr, timeStr)
        alert('Saved as reminder! Check the Notes page to view and edit it.')
      } else if (type === 'task') {
        await tasksService.createTask({
          title: aiResult.substring(0, 100),
          description: aiResult,
          source: 'ai_extracted',
          recording_id: recording?.id,
        })
        alert('Saved as task! Check the Notes page to view it.')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    }
  }

  const togglePin = async () => {
    if (!recording) return

    try {
      const { error } = await supabase
        .from('recordings')
        .update({ is_pinned: !recording.is_pinned })
        .eq('id', recording.id)

      if (error) throw error
      setRecording({ ...recording, is_pinned: !recording.is_pinned })
      setMoreModalOpen(false)
    } catch (error) {
      console.error('Toggle pin error:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!recording) return

    try {
      const { error } = await supabase
        .from('recordings')
        .update({ is_favorite: !recording.is_favorite })
        .eq('id', recording.id)

      if (error) throw error
      setRecording({ ...recording, is_favorite: !recording.is_favorite })
    } catch (error) {
      console.error('Toggle favorite error:', error)
    }
  }

  const saveTags = async () => {
    if (!recording) return

    try {
      const { error } = await supabase
        .from('recordings')
        .update({ tags })
        .eq('id', recording.id)

      if (error) throw error
      setRecording({ ...recording, tags })
      setTagModalOpen(false)
      alert('Tags updated successfully')
    } catch (error) {
      console.error('Save tags error:', error)
      alert('Failed to update tags')
    }
  }

  const saveTitle = async () => {
    if (!recording || !editTitle.trim()) return

    try {
      const { error } = await supabase
        .from('recordings')
        .update({ title: editTitle.trim() })
        .eq('id', recording.id)

      if (error) throw error
      setRecording({ ...recording, title: editTitle.trim() })
      setEditTitleModal(false)
      alert('Title updated successfully')
    } catch (error) {
      console.error('Save title error:', error)
      alert('Failed to update title')
    }
  }

  const deleteRecording = async () => {
    if (!recording || !confirm('Are you sure you want to delete this recording?')) return

    setMoreModalOpen(false)

    try {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      }

      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recording.id)

      if (error) throw error

      router.push('/dashboard')
      setTimeout(() => alert('Recording deleted successfully'), 300)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete recording')
    }
  }

  const downloadAudio = () => {
    if (!recording) return
    setMoreModalOpen(false)

    const link = document.createElement('a')
    link.href = recording.audio_url
    link.download = `${recording.title}.m4a`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateTranscript = async () => {
    if (!recording || aiProcessing) return

    setAiProcessing(true)
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id, audioUrl: recording.audio_url })
      })

      if (!response.ok) throw new Error('Transcription failed')

      const { transcript } = await response.json()

      const { error } = await supabase
        .from('recordings')
        .update({ transcript })
        .eq('id', recording.id)

      if (error) throw error
      setRecording({ ...recording, transcript })
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Failed to generate transcript')
    } finally {
      setAiProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading recording...</p>
        </div>
      </div>
    )
  }

  if (!recording) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Recording not found</h2>
          <Link href="/dashboard" className="text-[#A855F7] hover:text-[#9333EA]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                className={`w-6 h-6 ${recording.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                fill={recording.is_favorite ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
            <button
              onClick={() => setMoreModalOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 pb-32">
        {/* Title & Info */}
        <div className="mb-6">
          <div className="flex items-start gap-2 mb-2">
            {recording.is_pinned && (
              <svg className="w-5 h-5 text-[#A855F7] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            )}
            <h1 className="text-3xl font-black flex-1">{recording.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span>{new Date(recording.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
            <span>•</span>
            <span>{formatTime(recording.duration)}</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] rounded-full text-sm font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Transcript */}
        {recording.transcript ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Transcript</h2>
              <button
                onClick={() => copyToClipboard(recording.transcript || '')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Copy transcript"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{recording.transcript}</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-center">
            <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-bold mb-2">No transcript yet</h3>
            <p className="text-gray-400 mb-4">Generate a transcript to unlock AI features</p>
            <button
              onClick={generateTranscript}
              disabled={aiProcessing}
              className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
            >
              {aiProcessing ? 'Generating...' : 'Generate Transcript'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Player */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10">
        <audio ref={audioRef} src={recording.audio_url} preload="metadata" />

        {/* Player Controls */}
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 flex-shrink-0 rounded-full bg-[#A855F7] hover:bg-[#9333EA] flex items-center justify-center transition-all"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400 w-12 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={recording.duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #A855F7 0%, #A855F7 ${(currentTime / recording.duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / recording.duration) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <span className="text-xs text-gray-400 w-12">{formatTime(recording.duration)}</span>
              </div>
            </div>

            {/* Speed */}
            <button
              onClick={handleSpeedChange}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>

        {/* AI Actions Button */}
        {recording.transcript && (
          <div className="max-w-5xl mx-auto px-6 pb-4">
            <button
              onClick={() => setAiModalOpen(true)}
              className="w-full bg-[#A855F7] hover:bg-[#9333EA] py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI Actions
            </button>
          </div>
        )}
      </div>

      {/* AI Actions Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setAiModalOpen(false)}>
          <div className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-black mb-6">AI Actions</h2>

            <div className="space-y-3">
              <button
                onClick={() => handleAiAction('summary')}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Meeting Summary</div>
                  <div className="text-sm text-gray-400">Get a concise summary</div>
                </div>
              </button>

              <button
                onClick={() => handleAiAction('todo')}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Generate To-Do List</div>
                  <div className="text-sm text-gray-400">Extract action items</div>
                </div>
              </button>

              <button
                onClick={() => handleAiAction('points')}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Extract Main Points</div>
                  <div className="text-sm text-gray-400">Key takeaways from meeting</div>
                </div>
              </button>

              <button
                onClick={() => handleAiAction('translate')}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Translate</div>
                  <div className="text-sm text-gray-400">Translate to Spanish</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Options Modal */}
      {moreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setMoreModalOpen(false)}>
          <div className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-black mb-6">Options</h2>

            <div className="space-y-2">
              <button onClick={togglePin} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all text-left">
                <svg className="w-6 h-6 text-[#A855F7]" fill={recording.is_pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{recording.is_pinned ? 'Unpin Recording' : 'Pin Recording'}</span>
              </button>

              <button onClick={() => { setMoreModalOpen(false); setTagModalOpen(true) }} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all text-left">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Manage Tags</span>
              </button>

              <button onClick={downloadAudio} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all text-left">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Audio</span>
              </button>

              <button onClick={() => { setMoreModalOpen(false); setEditTitleModal(true) }} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all text-left">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Title</span>
              </button>

              {recording.transcript && (
                <button onClick={() => { copyToClipboard(recording.transcript || ''); setMoreModalOpen(false) }} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all text-left">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Transcript</span>
                </button>
              )}

              <button onClick={deleteRecording} className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl transition-all text-left text-red-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Recording</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Result Modal */}
      {aiResultModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setAiResultModal(false)}>
          <div className="w-full max-w-3xl bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-6">AI Result</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{aiResult}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(aiResult)}
                className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              <button
                onClick={() => { setAiResultModal(false); setSaveAsModalOpen(true) }}
                className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save As
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save As Modal */}
      {saveAsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSaveAsModalOpen(false)}>
          <div className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-black mb-6">Save As</h2>

            <div className="space-y-3">
              <button onClick={() => handleSaveAs('note')} className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left">
                <div className="w-12 h-12 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-semibold">Save as Note</span>
              </button>

              <button onClick={() => handleSaveAs('reminder')} className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left">
                <div className="w-12 h-12 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="font-semibold">Save as Reminder</span>
              </button>

              <button onClick={() => handleSaveAs('task')} className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left">
                <div className="w-12 h-12 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span className="font-semibold">Save as Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      {editTitleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEditTitleModal(false)}>
          <div className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-6">Edit Title</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditTitleModal(false)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveTitle}
                className="flex-1 px-6 py-3 bg-[#A855F7] hover:bg-[#9333EA] rounded-full font-semibold transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {tagModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setTagModalOpen(false)}>
          <div className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-6">Manage Tags</h2>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim() && !tags.includes(newTag.trim())) {
                    setTags([...tags, newTag.trim()])
                    setNewTag('')
                  }
                }}
                placeholder="Add a tag"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              />
              <button
                onClick={() => {
                  if (newTag.trim() && !tags.includes(newTag.trim())) {
                    setTags([...tags, newTag.trim()])
                    setNewTag('')
                  }
                }}
                className="px-6 py-3 bg-[#A855F7] hover:bg-[#9333EA] rounded-xl font-semibold transition-all"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 min-h-[100px] max-h-[200px] overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-gray-500 text-center w-full py-4">No tags added yet</p>
              ) : (
                tags.map((tag, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 bg-[#A855F7] rounded-full flex items-center gap-2"
                  >
                    <span className="font-semibold">{tag}</span>
                    <button
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setTagModalOpen(false); setTags(recording?.tags || []) }}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveTags}
                className="flex-1 px-6 py-3 bg-[#A855F7] hover:bg-[#9333EA] rounded-full font-semibold transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Processing Overlay */}
      {aiProcessing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Processing with AI...</p>
          </div>
        </div>
      )}
    </div>
  )
}
