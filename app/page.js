'use client'

import { useState, useEffect } from 'react'

// Simple SVG Icons
const MicrophoneIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const WalletIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const ClipboardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const DocumentIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const SmileIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const PlayCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const XIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const LinkedInIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const YouTubeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('nav') && !event.target.closest('[role="menu"]')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id))
          }
        })
      },
      { threshold: 0.2 }
    )

    const sections = document.querySelectorAll('[data-animate]')
    sections.forEach(section => observer.observe(section))

    return () => {
      sections.forEach(section => observer.unobserve(section))
    }
  }, [])

  const features = [
    {
      icon: MicrophoneIcon,
      title: 'Voice First',
      description: 'Tap and talk from anywhere. Your voice becomes reminders, notes, and tasks instantly.',
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: BellIcon,
      title: 'Smart Reminders',
      description: 'Never forget anything. AI understands context and sets perfect reminders.',
      color: '#10B981',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: WalletIcon,
      title: 'Finance Tracking',
      description: 'Track expenses by voice. Get insights on spending and manage budgets effortlessly.',
      color: '#F59E0B',
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      icon: ClipboardIcon,
      title: 'Life Tasks',
      description: 'Insurance renewals, appointments, maintenance - never miss important life admin.',
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: HeartIcon,
      title: 'Personal Events',
      description: 'Birthdays, anniversaries, special dates. Get reminded with gift ideas.',
      color: '#EC4899',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      icon: SmileIcon,
      title: 'Daily Check-in',
      description: 'Track your mood, energy, and wellness. Build better habits with AI insights.',
      color: '#06B6D4',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: DocumentIcon,
      title: 'Smart Documents',
      description: 'Generate proposals, reports, and documents from templates with AI assistance.',
      color: '#6366F1',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: ChatIcon,
      title: 'AI Assistant',
      description: 'Chat with your personal AI about anything. Get help, advice, and answers.',
      color: '#EF4444',
      gradient: 'from-red-500 to-red-600'
    }
  ]

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <nav className={`glass rounded-full px-4 sm:px-5 py-2 flex items-center justify-between transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="PAssist AI Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-black">PAssist AI</span>
            </div>
            <ul className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-medium">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
            <div className="flex items-center gap-3">
              <a href="/login" className="hidden sm:block text-white hover:text-primary px-4 py-2 rounded-full font-semibold text-sm transition-colors">
                Login
              </a>
              <a href="/signup" className="hidden sm:block bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all btn-hover-effect">
                Get Started
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div role="menu" className="lg:hidden fixed top-20 left-4 right-4 glass rounded-3xl p-6 animate-fadeInUp">
            <ul className="space-y-4">
              <li><a href="#features" className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a></li>
              <li><a href="#how-it-works" className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a></li>
              <li><a href="#pricing" className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a></li>
              <li><a href="/login" className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors text-center" onClick={() => setMobileMenuOpen(false)}>Login</a></li>
              <li><a href="/signup" className="block bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 rounded-full font-semibold text-center transition-all" onClick={() => setMobileMenuOpen(false)}>Get Started</a></li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 md:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[1000px] sm:h-[1000px] bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 sm:space-y-8 animate-fadeInUp">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm">
              <SparklesIcon className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Your AI-Powered Life Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight max-w-5xl mx-auto">
              Just <span className="gradient-text">Talk</span> and Let AI<br className="hidden sm:block" />
              Handle the Rest
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Your personal assistant that turns voice into action. Reminders, finances, life tasks, wellness tracking - all managed by simply speaking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="/signup" className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-8 py-4 rounded-full font-semibold text-lg transition-all btn-hover-effect flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5" />
              </a>
              <a href="#how-it-works" className="w-full sm:w-auto glass px-8 py-4 rounded-full font-semibold text-lg transition-all btn-hover-effect flex items-center justify-center gap-2">
                <PlayCircleIcon className="w-6 h-6" />
                Watch Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - App Preview */}
          <div className="mt-12 sm:mt-20 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Browser Frame */}
              <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white/5 rounded-full px-4 py-1 text-sm text-gray-400">
                      app.passist.ai
                    </div>
                  </div>
                </div>
                {/* Dashboard Preview */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
                  {/* Simplified Dashboard UI */}
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Sidebar */}
                    <div className="col-span-3 hidden sm:block bg-white/5 rounded-xl p-4 space-y-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-2 pt-4">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-8 rounded-lg ${i === 1 ? 'bg-purple-500/20' : 'bg-white/5'}`}></div>
                        ))}
                      </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-span-12 sm:col-span-9 space-y-4">
                      {/* Header with Record Button */}
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-32 bg-white/10 rounded"></div>
                        <div className="bg-purple-500 rounded-full px-4 py-2 flex items-center gap-2">
                          <MicrophoneIcon className="w-4 h-4" />
                          <span className="text-sm font-medium hidden sm:inline">Record</span>
                        </div>
                      </div>
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { color: 'bg-purple-500/20', icon: BellIcon },
                          { color: 'bg-green-500/20', icon: WalletIcon },
                          { color: 'bg-blue-500/20', icon: ClipboardIcon },
                          { color: 'bg-pink-500/20', icon: HeartIcon }
                        ].map((card, i) => (
                          <div key={i} className={`${card.color} rounded-xl p-3 sm:p-4`}>
                            <card.icon className="w-5 h-5 mb-2" />
                            <div className="h-4 w-12 bg-white/20 rounded"></div>
                          </div>
                        ))}
                      </div>
                      {/* Content Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="h-4 w-24 bg-white/10 rounded mb-3"></div>
                          <div className="space-y-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="h-10 bg-white/5 rounded-lg"></div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="h-4 w-24 bg-white/10 rounded mb-3"></div>
                          <div className="space-y-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="h-10 bg-white/5 rounded-lg"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" data-animate className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${visibleSections.has('stats') ? 'animate-fadeIn' : 'opacity-0'}`}>
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '2M+', label: 'Tasks Created' },
              { value: '500K+', label: 'Voice Commands' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-5xl md:text-6xl font-black gradient-text">{stat.value}</div>
                <div className="text-gray-400 mt-2 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" data-animate className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className={`text-center mb-12 sm:mb-16 space-y-4 ${visibleSections.has('features') ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
              Everything You Need,<br className="hidden sm:block" />
              <span className="gradient-text">Voice Powered</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              One app to manage your entire life. Just speak and watch the magic happen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all group cursor-pointer border border-white/5 hover:border-white/20"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" data-animate className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-12 sm:mb-16 space-y-4 ${visibleSections.has('how-it-works') ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Three simple steps to transform how you manage your life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: '01',
                title: 'Tap & Speak',
                description: 'Hit the record button from anywhere in the app and speak naturally. "Remind me to call mom tomorrow" or "Add $50 groceries expense".',
                icon: MicrophoneIcon,
                color: '#8B5CF6'
              },
              {
                step: '02',
                title: 'AI Understands',
                description: 'Our AI instantly understands your intent, extracts the details, and categorizes everything automatically.',
                icon: SparklesIcon,
                color: '#10B981'
              },
              {
                step: '03',
                title: 'Done!',
                description: 'Your reminder is set, expense is logged, or task is created. Get notifications when things are due.',
                icon: CheckIcon,
                color: '#3B82F6'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent -translate-x-1/2"></div>
                )}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl glass border border-white/10" style={{ boxShadow: `0 0 60px ${item.color}30` }}>
                    <item.icon className="w-10 h-10" style={{ color: item.color }} />
                  </div>
                  <div className="text-5xl font-black text-white/10">{item.step}</div>
                  <h3 className="text-xl sm:text-2xl font-bold">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Demo Section */}
      <section data-animate className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">Try Saying...</h2>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {[
                  '"Remind me to take medicine at 9am"',
                  '"Add $45 for lunch"',
                  '"Mom\'s birthday is March 15"',
                  '"Schedule dentist next week"',
                  '"How am I feeling today?"'
                ].map((phrase, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-300 hover:bg-white/10 transition-colors cursor-pointer">
                    {phrase}
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <a href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-8 py-4 rounded-full font-semibold text-lg transition-all">
                  <MicrophoneIcon className="w-5 h-5" />
                  Try It Now - Free
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" data-animate className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-12 sm:mb-16 space-y-4 ${visibleSections.has('pricing') ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
              <span className="gradient-text">Simple Pricing</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Free Plan */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-black">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['50 voice commands/month', 'Basic reminders', 'Notes & tasks', 'Mobile app access'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="/signup" className="block w-full glass border border-white/10 hover:bg-white/10 px-6 py-3 rounded-full font-semibold text-center transition-all">
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For power users</p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-black">$9.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited voice commands', 'All features unlocked', 'Finance tracking', 'Life tasks & events', 'Daily check-ins', 'Priority support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="/signup" className="block w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 rounded-full font-semibold text-center transition-all">
                Start Free Trial
              </a>
            </div>

            {/* Team Plan */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Team</h3>
              <p className="text-gray-400 mb-6">For families & teams</p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-black">$24.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 5 users', 'Everything in Pro', 'Shared calendars', 'Family events', 'Collaborative tasks', 'Admin dashboard'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="/signup" className="block w-full glass border border-white/10 hover:bg-white/10 px-6 py-3 rounded-full font-semibold text-center transition-all">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" data-animate className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-12 sm:mb-16 space-y-4 ${visibleSections.has('testimonials') ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">Loved by Thousands</h2>
            <p className="text-lg sm:text-xl text-gray-400">See what our users are saying</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: 'Entrepreneur', text: 'PAssist AI has completely changed how I manage my day. I just talk and everything gets organized. It\'s like having a personal secretary.' },
              { name: 'David K.', role: 'Software Engineer', text: 'The voice-to-finance feature is incredible. I track all expenses by just speaking. My budgeting has never been easier.' },
              { name: 'Emily R.', role: 'Working Mom', text: 'Between work and kids, I was always forgetting things. Now I just tell PAssist and it handles reminders, birthdays, everything!' },
              { name: 'Michael T.', role: 'Freelancer', text: 'The AI understands context so well. I can say "remind me about the Johnson project" and it knows exactly what I mean.' },
              { name: 'Lisa P.', role: 'Health Coach', text: 'I love the daily check-in feature. Tracking my clients\' wellness by voice is so much faster than typing everything.' },
              { name: 'James W.', role: 'Retiree', text: 'At my age, remembering medications and appointments was tough. PAssist makes it simple - I just talk to it!' }
            ].map((testimonial, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-sm font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-white/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-500/20 to-transparent"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                Ready to Simplify Your Life?
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Join thousands of users who have transformed how they manage their daily life. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/signup" className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
                <a href="#" className="w-full sm:w-auto text-gray-400 hover:text-white px-8 py-4 font-semibold transition-colors">
                  Schedule a Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="PAssist AI Logo" className="w-10 h-10 rounded-lg" />
                <span className="text-xl font-bold">PAssist AI</span>
              </div>
              <p className="text-gray-400 text-sm">Your AI-powered personal assistant for a simpler life.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">&copy; 2025 PAssist AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><FacebookIcon className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><InstagramIcon className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><XIcon className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><LinkedInIcon className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><YouTubeIcon className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
