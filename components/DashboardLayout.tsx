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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* Main */}
            <Link href="/dashboard" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/dashboard') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/calendar" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/calendar') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Calendar</span>
            </Link>

            {/* Productivity */}
            <div className="pt-4 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Productivity</p>
            </div>

            <Link href="/reminders" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/reminders') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Reminders</span>
            </Link>

            <Link href="/notes" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/notes') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Notes</span>
            </Link>

            <Link href="/recordings" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/recordings') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Recordings</span>
            </Link>

            <Link href="/documents" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/documents') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documents</span>
            </Link>

            <Link href="/finance" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/finance') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Finance</span>
            </Link>

            {/* Personal */}
            <div className="pt-4 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal</p>
            </div>

            <Link href="/checkin" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/checkin') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Daily Check-in</span>
            </Link>

            <Link href="/personal" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/personal') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Personal Events</span>
            </Link>

            <Link href="/life-tasks" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/life-tasks') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Life Tasks</span>
            </Link>

            <Link href="/family-reminders" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/family-reminders') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Family Reminders</span>
            </Link>

            <Link href="/checkin-reminders" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/checkin-reminders') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Check-in Reminders</span>
            </Link>

            {/* Assistant */}
            <div className="pt-4 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Assistant</p>
            </div>

            <Link href="/travel" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/travel') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Travel Booking</span>
            </Link>

            <Link href="/transport" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/transport') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Transport</span>
            </Link>

            <Link href="/reservations" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/reservations') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Reservations</span>
            </Link>

            {/* Business */}
            <div className="pt-4 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Business</p>
            </div>

            <Link href="/strategy" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/strategy') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Strategy Insights</span>
            </Link>

            <Link href="/patterns" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/patterns') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Pattern Detection</span>
            </Link>

            <Link href="/financial-insights" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/financial-insights') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Financial Insights</span>
            </Link>

            <Link href="/operations" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/operations') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Operational Alerts</span>
            </Link>

            {/* Sales */}
            <div className="pt-4 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sales</p>
            </div>

            <Link href="/proposals" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/proposals') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Client Proposals</span>
            </Link>

            <Link href="/sales-emails" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/sales-emails') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Sales Emails</span>
            </Link>

            {/* More */}
            <div className="pt-4 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">More</p>
            </div>

            <Link href="/chat-ai" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/chat-ai') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI Assistant</span>
            </Link>

            <Link href="/settings" className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl ${isActivePath('/settings') ? 'bg-[#A855F7]/10 text-[#A855F7] font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}>
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
          <div className="p-3 sm:p-4 lg:p-6 w-full">
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
