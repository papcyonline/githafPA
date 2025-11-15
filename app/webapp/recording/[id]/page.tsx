'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase, Recording } from '@/lib/supabase'
import Link from 'next/link'

export default function RecordingDetail() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const audioRef = useRef<HTMLAudioElement>(null)

  const [recording, setRecording] = useState<Recording | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'keypoints'>('transcript')

  useEffect(() => {
    if (params.id) {
      fetchRecording()
    }
  }, [params.id])

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
    } catch (error) {
      console.error('Error fetching recording:', error)
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
      console.error('Error toggling favorite:', error)
    }
  }

  const generateTranscript = async () => {
    if (!recording || processing) return

    setProcessing(true)
    try {
      // Call OpenAI Whisper API for transcription
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
      console.error('Error generating transcript:', error)
      alert('Failed to generate transcript')
    } finally {
      setProcessing(false)
    }
  }

  const generateSummary = async () => {
    if (!recording?.transcript || processing) return

    setProcessing(true)
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id, transcript: recording.transcript })
      })

      if (!response.ok) throw new Error('Summary generation failed')

      const { summary, keyPoints } = await response.json()

      const { error } = await supabase
        .from('recordings')
        .update({ summary, key_points: keyPoints })
        .eq('id', recording.id)

      if (error) throw error
      setRecording({ ...recording, summary, key_points: keyPoints })
    } catch (error) {
      console.error('Error generating summary:', error)
      alert('Failed to generate summary')
    } finally {
      setProcessing(false)
    }
  }

  const deleteRecording = async () => {
    if (!recording || !confirm('Are you sure you want to delete this recording?')) return

    try {
      // Delete from storage
      const urlParts = recording.audio_url.split('/')
      const filePath = `${user?.id}/${urlParts[urlParts.length - 1]}`

      await supabase.storage.from('recordings').remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recording.id)

      if (error) throw error

      router.push('/webapp')
    } catch (error) {
      console.error('Error deleting recording:', error)
      alert('Failed to delete recording')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400">Loading recording...</p>
        </div>
      </div>
    )
  }

  if (!recording) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Recording not found</h2>
          <Link href="/webapp" className="text-primary hover:text-purple-400">
            Back to Recordings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/webapp" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Recordings
        </Link>

        {/* Recording Header */}
        <div className="glass rounded-3xl p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black mb-2">{recording.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span>{formatTime(recording.duration)}</span>
                <span>•</span>
                <span>{new Date(recording.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{(recording.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              className="p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <svg className={`w-6 h-6 ${recording.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>

          {/* Audio Player */}
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6">
            <audio ref={audioRef} src={recording.audio_url} preload="metadata" />

            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlayPause}
                className="bg-white text-black hover:bg-gray-200 p-4 rounded-full transition-all flex-shrink-0"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={recording.duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-300 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(recording.duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {!recording.transcript && (
              <button
                onClick={generateTranscript}
                disabled={processing}
                className="bg-primary hover:bg-purple-600 px-4 py-2 rounded-full font-semibold transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{processing ? 'Processing...' : 'Generate Transcript'}</span>
              </button>
            )}
            {recording.transcript && !recording.summary && (
              <button
                onClick={generateSummary}
                disabled={processing}
                className="bg-secondary hover:opacity-90 px-4 py-2 rounded-full font-semibold transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>{processing ? 'Processing...' : 'Generate Summary'}</span>
              </button>
            )}
            <button
              onClick={deleteRecording}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-full font-semibold transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {(recording.transcript || recording.summary || recording.key_points) && (
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex border-b border-white/10 mb-6">
              {recording.transcript && (
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'transcript' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  Transcript
                </button>
              )}
              {recording.summary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'summary' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  Summary
                </button>
              )}
              {recording.key_points && recording.key_points.length > 0 && (
                <button
                  onClick={() => setActiveTab('keypoints')}
                  className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'keypoints' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  Key Points
                </button>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              {activeTab === 'transcript' && recording.transcript && (
                <p className="text-gray-300 whitespace-pre-wrap">{recording.transcript}</p>
              )}
              {activeTab === 'summary' && recording.summary && (
                <p className="text-gray-300 whitespace-pre-wrap">{recording.summary}</p>
              )}
              {activeTab === 'keypoints' && recording.key_points && (
                <ul className="space-y-2">
                  {recording.key_points.map((point, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #A855F7;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #A855F7;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
