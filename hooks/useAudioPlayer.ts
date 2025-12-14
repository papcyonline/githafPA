/**
 * useAudioPlayer Hook
 * Single Responsibility: Manage audio playback state
 *
 * Fixes:
 * - Prevents multiple simultaneous plays
 * - Proper cleanup on unmount
 * - Progress tracking
 * - Memory leak prevention
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  progress: number
  currentTrackId: string | null
}

export interface UseAudioPlayerReturn extends AudioPlayerState {
  play: (trackId: string, audioUrl: string) => void
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  togglePlayPause: (trackId: string, audioUrl: string) => void
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    currentTrackId: null,
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Update progress during playback
  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current
      setState(prev => ({
        ...prev,
        currentTime,
        duration: duration || 0,
        progress: duration ? (currentTime / duration) * 100 : 0,
      }))
      animationRef.current = requestAnimationFrame(updateProgress)
    }
  }, [])

  // Play audio
  const play = useCallback((trackId: string, audioUrl: string) => {
    // Stop current audio if different track
    if (audioRef.current && state.currentTrackId !== trackId) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    // Create or reuse audio element
    if (!audioRef.current || state.currentTrackId !== trackId) {
      audioRef.current = new Audio(audioUrl)

      audioRef.current.onloadedmetadata = () => {
        setState(prev => ({
          ...prev,
          duration: audioRef.current?.duration || 0,
        }))
      }

      audioRef.current.onended = () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0,
          progress: 0,
        }))
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }

      audioRef.current.onerror = () => {
        console.error('Audio playback error')
        setState(prev => ({
          ...prev,
          isPlaying: false,
        }))
      }
    }

    // Play
    audioRef.current.play().then(() => {
      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentTrackId: trackId,
      }))
      animationRef.current = requestAnimationFrame(updateProgress)
    }).catch(error => {
      console.error('Failed to play audio:', error)
    })
  }, [state.currentTrackId, updateProgress])

  // Pause audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setState(prev => ({ ...prev, isPlaying: false }))
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Stop audio and reset
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setState({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        progress: 0,
        currentTrackId: null,
      })
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Seek to time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setState(prev => ({
        ...prev,
        currentTime: time,
        progress: prev.duration ? (time / prev.duration) * 100 : 0,
      }))
    }
  }, [])

  // Toggle play/pause
  const togglePlayPause = useCallback((trackId: string, audioUrl: string) => {
    if (state.currentTrackId === trackId && state.isPlaying) {
      pause()
    } else {
      play(trackId, audioUrl)
    }
  }, [state.currentTrackId, state.isPlaying, play, pause])

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    togglePlayPause,
  }
}

/**
 * Format seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
