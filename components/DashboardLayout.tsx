'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../lib/auth-context'
import FloatingAIChat from './FloatingAIChat'
import AudioRecorder from './AudioRecorder'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const isActivePath = (path: string) => pathname === path

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky inset-y-0 lg:top-0 left-0 z-50 w-64 lg:h-screen bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full lg:h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <img src="/logo.png" alt="PAssist AI" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-black text-gray-900">PAssist AI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/dashboard" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/dashboard') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/reminders" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/reminders') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Reminders</span>
            </Link>

            <Link href="/notes" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/notes') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Notes</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Productivity</p>
            </div>

            <Link href="/recordings" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/recordings') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Recordings</span>
            </Link>

            <Link href="/finance" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/finance') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Finance</span>
            </Link>

            <Link href="/documents" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/documents') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documents</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal</p>
            </div>

            <Link href="/checkin" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/checkin') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Daily Check-in</span>
            </Link>

            <Link href="/personal" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/personal') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Personal Events</span>
            </Link>

            <Link href="/life-tasks" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/life-tasks') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Life Tasks</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">More</p>
            </div>

            <Link href="/chat-ai" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/chat-ai') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI Assistant</span>
            </Link>

            <Link href="/settings" className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActivePath('/settings') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-[#A855F7] flex items-center justify-center font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-900">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full mt-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-colors flex items-center justify-center gap-2"
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
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 sm:h-16 border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 bg-white/80 backdrop-blur-lg">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Global Record Button */}
          <button
            onClick={() => setShowRecorder(true)}
            className="ml-auto bg-[#A855F7] hover:bg-[#9333EA] px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-sm sm:text-base shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-white"
          >
            <div className="relative">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            <span className="hidden sm:inline">Record</span>
          </button>
        </header>

        {/* Content Area - Only this scrolls */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-6">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating AI Chat */}
      <FloatingAIChat />

      {/* Global Audio Recorder Modal */}
      {showRecorder && (
        <AudioRecorder
          onClose={() => setShowRecorder(false)}
          onRecordingComplete={() => {
            // Trigger a custom event so pages can refresh their data if needed
            window.dispatchEvent(new CustomEvent('recording-complete'))
          }}
        />
      )}
    </div>
  )
}
