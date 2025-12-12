'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface AudioRecorderProps {
  onClose: () => void
  onRecordingComplete: () => void
}

export default function AudioRecorder({ onClose, onRecordingComplete }: AudioRecorderProps) {
  const { user } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopTimer()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      startTimer()
      setError('')
    } catch (err: any) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please grant permission.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      stopTimer()
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startTimer()
    }
  }

  const stopRecording = () => {
    return new Promise<Blob>((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          resolve(audioBlob)
        }
        mediaRecorderRef.current.stop()
        stopTimer()
        setIsRecording(false)
        setIsPaused(false)

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }
    })
  }

  const saveRecording = async () => {
    setUploading(true)
    setError('')

    try {
      const audioBlob = await stopRecording()

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `recording-${timestamp}.webm`
      const filePath = `${user?.id}/${filename}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(filePath)

      // Create database record
      const { data: recordingData, error: dbError } = await supabase
        .from('recordings')
        .insert({
          user_id: user?.id,
          title: `Recording ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          audio_url: publicUrl,
          duration: duration,
          file_size: audioBlob.size,
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Auto-transcribe the recording
      setTranscribing(true)
      try {
        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioUrl: publicUrl }),
        })

        if (transcribeResponse.ok) {
          const { transcript } = await transcribeResponse.json()

          if (transcript) {
            // Update recording with transcript
            await supabase
              .from('recordings')
              .update({
                transcript,
                updated_at: new Date().toISOString()
              })
              .eq('id', recordingData.id)

            // Parse the voice command with AI
            try {
              const parseResponse = await fetch('/api/parse-voice-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript }),
              })

              if (parseResponse.ok) {
                const parsed = await parseResponse.json()

                // Auto-create the appropriate item based on parsed type
                if (parsed.type === 'reminder' && parsed.title) {
                  await supabase.from('reminders').insert({
                    user_id: user?.id,
                    title: parsed.title,
                    description: parsed.description || transcript,
                    reminder_date: parsed.date || new Date().toISOString().split('T')[0],
                    reminder_time: parsed.time || '09:00',
                  })
                } else if (parsed.type === 'task' && parsed.title) {
                  await supabase.from('tasks').insert({
                    user_id: user?.id,
                    title: parsed.title,
                    description: parsed.description || transcript,
                    due_date: parsed.date || null,
                    priority: parsed.priority || 'medium',
                    completed: false,
                    source: 'ai_extracted',
                    recording_id: recordingData.id,
                  })
                } else if (parsed.type === 'note' && parsed.title) {
                  await supabase.from('notes').insert({
                    user_id: user?.id,
                    title: parsed.title,
                    content: parsed.description || transcript,
                  })
                } else if (parsed.type === 'event' && parsed.title) {
                  const eventDate = parsed.date || new Date().toISOString().split('T')[0]
                  const startTime = parsed.time || '09:00'
                  const startDateTime = `${eventDate}T${startTime}:00`
                  const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString()

                  await supabase.from('calendar_events').insert({
                    user_id: user?.id,
                    title: parsed.title,
                    description: parsed.description || transcript,
                    start_time: new Date(startDateTime).toISOString(),
                    end_time: endDateTime,
                    recording_id: recordingData.id,
                  })
                }
              }
            } catch (parseError) {
              console.error('Voice command parsing failed:', parseError)
            }
          }
        }
      } catch (transcribeError) {
        console.error('Auto-transcription failed:', transcribeError)
        // Don't fail the save if transcription fails
      } finally {
        setTranscribing(false)
      }

      onRecordingComplete()
      onClose()
    } catch (err: any) {
      console.error('Error saving recording:', err)
      setError('Failed to save recording. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      stopTimer()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
    onClose()
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass rounded-3xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2">
            <span className="gradient-text">Audio Recorder</span>
          </h2>
          <p className="text-gray-400">Record your audio with AI transcription</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Recording Display */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-12 text-center">
            <div className="text-6xl font-black mb-4" style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {formatTime(duration)}
            </div>

            {isRecording && !isPaused && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-semibold">Recording...</span>
              </div>
            )}

            {isPaused && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-500 font-semibold">Paused</span>
              </div>
            )}

            {!isRecording && (
              <span className="text-gray-400">Ready to record</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={uploading}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 p-6 rounded-full transition-all disabled:opacity-50"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 p-6 rounded-full transition-all"
                >
                  <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="bg-green-500/20 hover:bg-green-500/30 p-6 rounded-full transition-all"
                >
                  <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

              <button
                onClick={saveRecording}
                disabled={uploading}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 p-6 rounded-full transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

        {/* Cancel Button */}
        <button
          onClick={cancelRecording}
          disabled={uploading || transcribing}
          className="w-full glass px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
        >
          {transcribing ? 'Transcribing & Processing...' : uploading ? 'Saving...' : 'Cancel'}
        </button>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {transcribing
            ? 'AI is processing your voice command...'
            : 'Say things like "Remind me to call John tomorrow" or "Add a task to buy groceries"'}
        </p>
      </div>
    </div>
  )
}
