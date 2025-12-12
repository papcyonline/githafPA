'use client'

import { useState, useEffect } from 'react'

// Simple SVG Icons - No external dependencies needed
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

const DocumentTextIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ChatBubbleLeftRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const DocumentArrowDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m0 0l-2-2m2 2l2-2" />
  </svg>
)

const GlobeAltIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MagnifyingGlassIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CpuChipIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
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

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [lineVisible, setLineVisible] = useState(false)
  const [flareVisible, setFlareVisible] = useState(false)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside
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
            setLineVisible(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    const section = document.getElementById('recording-section')
    if (section) {
      observer.observe(section)
    }

    return () => {
      if (section) {
        observer.unobserve(section)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFlareVisible(true)
          }
        })
      },
      { threshold: 0.5 }
    )

    const flareSection = document.getElementById('horizontal-flare')
    if (flareSection) {
      observer.observe(flareSection)
    }

    return () => {
      if (flareSection) {
        observer.unobserve(flareSection)
      }
    }
  }, [])

  // Scroll animations for sections
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

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <nav className={`glass rounded-full px-4 sm:px-5 py-2 flex items-center justify-between transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="MeetAI Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-black">MeetAI</span>
            </div>
            <ul className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-medium">
              <li><a href="#recording-section" className="hover:text-primary transition-colors">Record</a></li>
              <li><a href="#transcription-section" className="hover:text-primary transition-colors">Transcript</a></li>
              <li><a href="#summaries-section" className="hover:text-primary transition-colors">AI Actions</a></li>
              <li><a href="#folders-section" className="hover:text-primary transition-colors">Organize</a></li>
              <li><a href="#ai-chat-section" className="hover:text-primary transition-colors">AI Chat</a></li>
              <li><a href="#chat-friends-section" className="hover:text-primary transition-colors">Share</a></li>
            </ul>
            <div className="flex items-center gap-3">
              <a href="/login" className="hidden sm:block text-white hover:text-primary px-4 py-2 rounded-full font-semibold text-sm transition-colors">
                Login
              </a>
              <a href="/signup" className="hidden sm:block bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all btn-hover-effect">
                Sign Up
              </a>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <CloseIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div role="menu" className="lg:hidden fixed top-20 left-4 right-4 glass rounded-3xl p-6 animate-fadeInUp">
            <ul className="space-y-4">
              <li>
                <a
                  href="#recording-section"
                  className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Record
                </a>
              </li>
              <li>
                <a
                  href="#transcription-section"
                  className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Transcript
                </a>
              </li>
              <li>
                <a
                  href="#summaries-section"
                  className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Actions
                </a>
              </li>
              <li>
                <a
                  href="#folders-section"
                  className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Organize
                </a>
              </li>
              <li>
                <a
                  href="#ai-chat-section"
                  className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Chat
                </a>
              </li>
              <li>
                <a
                  href="#chat-friends-section"
                  className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Share
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/signup"
                  className="block bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 rounded-full font-semibold text-center transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 overflow-hidden max-w-full">
        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 md:h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight max-w-5xl mx-auto px-2">
              Never Miss a <br className="hidden sm:block" />
              <span className="gradient-text">Meeting Detail</span> Again
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto px-2">
              Record, transcribe, and summarize your meetings with AI. MeetAI turns hours of recordings into actionable notes in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-2">
              <a href="#download" className="w-full sm:w-auto bg-primary hover:bg-purple-600 px-8 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all btn-hover-effect text-center min-h-[48px] flex items-center justify-center">
                Download App
              </a>
              <a href="#how-it-works" className="w-full sm:w-auto glass px-8 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all btn-hover-effect flex items-center justify-center gap-2 min-h-[48px]">
                <PlayCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Watch Video
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-8 sm:mt-12 md:mt-20 flex justify-center relative">
            {/* Parallax Flares Behind Hand */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center -translate-y-[120px] sm:-translate-y-[180px]">
              <div className="absolute w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-primary rounded-full opacity-40 blur-3xl"></div>
              <div className="absolute w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-secondary rounded-full opacity-35 blur-3xl"></div>
            </div>

            <div className="relative max-w-xs sm:max-w-lg md:max-w-2xl w-full z-10 px-4">
              <img
                src="/one.png"
                alt="App Screen"
                className="absolute top-[2%] left-[37%] md:left-[36.5%] transform -translate-x-[50%] w-[42%] h-auto z-0"
                loading="eager"
              />
              <img
                src="/hand.webp"
                alt="MeetAI App"
                className="w-full h-auto relative z-10"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" data-animate className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-8 md:gap-12 lg:gap-20 ${visibleSections.has('stats-section') ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="text-left md:text-center flex-shrink-0">
              <div className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>10K+</div>
              <div className="text-gray-400 mt-1 sm:mt-3 md:mt-4 text-xs sm:text-lg md:text-xl lg:text-2xl xl:text-3xl whitespace-nowrap">Active Users</div>
            </div>
            <div className="hidden sm:block h-16 md:h-20 lg:h-32 w-px bg-gray-700 flex-shrink-0"></div>
            <div className="text-left md:text-center flex-shrink-0">
              <div className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>100K+</div>
              <div className="text-gray-400 mt-1 sm:mt-3 md:mt-4 text-xs sm:text-lg md:text-xl lg:text-2xl xl:text-3xl whitespace-nowrap">Meetings Recorded</div>
            </div>
            <div className="hidden sm:block h-16 md:h-20 lg:h-32 w-px bg-gray-700 flex-shrink-0"></div>
            <div className="text-left md:text-center flex-shrink-0">
              <div className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>12</div>
              <div className="text-gray-400 mt-1 sm:mt-3 md:mt-4 text-xs sm:text-lg md:text-xl lg:text-2xl xl:text-3xl whitespace-nowrap">Languages</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Title Section */}
      <section id="how-it-works-title" data-animate className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className={`text-center space-y-3 sm:space-y-4 ${visibleSections.has('how-it-works-title') ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">Your journey from recording to insights</p>
          </div>
        </div>
      </section>

      {/* Recording Screen Section */}
      <section id="recording-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="flex justify-center relative order-2 md:order-1 md:ml-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #8B5CF6, transparent 70%)'
                }}
              ></div>

              <img
                src="/nine.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="Recording Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className={`w-full h-80 transition-transform duration-2000 ease-out ${
                  lineVisible ? 'scale-y-100' : 'scale-y-0'
                }`}
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #8B5CF6, transparent)'
                }}
              ></div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-center md:text-left order-1 md:order-2 md:ml-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Record Audio
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Start recording with one tap. Capture every word.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-start">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#8B5CF6' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">One tap recording</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#8B5CF6' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">High quality audio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#8B5CF6' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Unlimited length</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Transcription Section */}
      <section id="transcription-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="space-y-4 sm:space-y-6 text-center md:text-right order-1 md:mr-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Get Transcript
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Audio automatically transcribed to text.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-end">
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#10B981' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Instant transcription</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#10B981' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">12 languages</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#10B981' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">High accuracy</span>
                </li>
              </ul>
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className="w-full h-80 transition-transform duration-2000 ease-out scale-y-100"
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #10B981, transparent)'
                }}
              ></div>
            </div>

            <div className="flex justify-center relative order-2 mr-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #10B981, transparent 70%)'
                }}
              ></div>

              <img
                src="/seven.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="Recording Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Smart Summaries Section */}
      <section id="summaries-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="flex justify-center relative order-2 md:order-1 md:ml-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #3B82F6, transparent 70%)'
                }}
              ></div>

              <img
                src="/six.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="Summaries Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className="w-full h-80 transition-transform duration-2000 ease-out scale-y-100"
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #3B82F6, transparent)'
                }}
              ></div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-center md:text-left order-1 md:order-2 md:ml-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                AI Actions
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Transform transcripts with powerful AI tools.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-start">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#3B82F6' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Summarize</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#3B82F6' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Extract main points</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#3B82F6' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Generate to do list</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#3B82F6' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Translate</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Save Section */}
      <section id="save-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="space-y-4 sm:space-y-6 text-center md:text-right order-1 md:mr-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Save & Organize
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Save your transcripts the way you work.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-end">
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#F59E0B' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Save as reminder</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#F59E0B' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Save as note</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#F59E0B' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Save as task</span>
                </li>
              </ul>
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className="w-full h-80 transition-transform duration-2000 ease-out scale-y-100"
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #F59E0B, transparent)'
                }}
              ></div>
            </div>

            <div className="flex justify-center relative order-2 mr-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #F59E0B, transparent 70%)'
                }}
              ></div>

              <img
                src="/save.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="Save Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Folders Section */}
      <section id="folders-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="flex justify-center relative order-2 md:order-1 md:ml-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #EF4444, transparent 70%)'
                }}
              ></div>

              <img
                src="/folder.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="Folders Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className="w-full h-80 transition-transform duration-2000 ease-out scale-y-100"
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #EF4444, transparent)'
                }}
              ></div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-center md:text-left order-1 md:order-2 md:ml-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Organize in Folders
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Keep your recordings organized and easy to find.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-start">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#EF4444' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Create folders</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#EF4444' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Sort recordings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#EF4444' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Quick access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <section id="ai-chat-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="space-y-4 sm:space-y-6 text-center md:text-right order-1 md:mr-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Chat with AI
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Ask questions about your recordings anytime.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-end">
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#06B6D4' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Ask questions</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#06B6D4' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Get insights</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#06B6D4' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Instant answers</span>
                </li>
              </ul>
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className="w-full h-80 transition-transform duration-2000 ease-out scale-y-100"
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #06B6D4, transparent)'
                }}
              ></div>
            </div>

            <div className="flex justify-center relative order-2 mr-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #06B6D4, transparent 70%)'
                }}
              ></div>

              <img
                src="/four.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="AI Chat Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Share Contacts Section */}
      <section id="share-contacts-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="flex justify-center relative order-2 md:order-1 md:ml-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #EC4899, transparent 70%)'
                }}
              ></div>

              <img
                src="/five.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="Share Contacts Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className="w-full h-80 transition-transform duration-2000 ease-out scale-y-100"
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #EC4899, transparent)'
                }}
              ></div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-center md:text-left order-1 md:order-2 md:ml-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Share with QR Code
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Share contacts easily by scanning QR codes.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-start">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#EC4899' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Generate QR code</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#EC4899' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Scan to connect</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#EC4899' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Instant sharing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Chat with Friends Section */}
      <section id="chat-friends-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-2 items-center relative">
            <div className="space-y-4 sm:space-y-6 text-center md:text-right order-1 md:mr-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Chat with Friends
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Share recordings and chat seamlessly.
              </p>
              <ul className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-end">
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#6366F1' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Direct messaging</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#6366F1' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Share recordings</span>
                </li>
                <li className="flex items-start gap-3 md:flex-row-reverse">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#6366F1' }}>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-300">Real-time chat</span>
                </li>
              </ul>
            </div>

            {/* Animated Gradient Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5">
              <div
                className="w-full h-80 transition-transform duration-2000 ease-out scale-y-100"
                style={{
                  transformOrigin: 'top',
                  background: 'linear-gradient(to bottom, transparent, #6366F1, transparent)'
                }}
              ></div>
            </div>

            <div className="flex justify-center relative order-2 mr-[40%]">
              {/* Oval Flare */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full opacity-40 blur-3xl z-0"
                style={{
                  background: 'radial-gradient(ellipse, #6366F1, transparent 70%)'
                }}
              ></div>

              <img
                src="/eight.png"
                alt="App Screen"
                className="absolute top-[4%] left-[50%] transform -translate-x-[50%] w-[65%] sm:w-[62%] md:w-[65%] h-auto z-5"
                loading="lazy"
              />
              <img
                src="/mobile.png"
                alt="Chat Screen"
                className="w-full max-w-[280px] h-auto rounded-3xl shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Flare Separator */}
      <section id="horizontal-flare" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl flex justify-center items-center">
          <div className="w-full h-1 relative">
            <div
              className={`h-full w-full transition-all duration-3000 ease-out ${
                flareVisible ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
              }`}
              style={{
                transformOrigin: 'center',
                background: 'linear-gradient(to right, transparent, #8B5CF6 20%, #10B981 50%, #8B5CF6 80%, transparent)'
              }}
            ></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" data-animate className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className={`text-center mb-12 sm:mb-16 md:mb-20 space-y-3 sm:space-y-4 ${visibleSections.has('pricing') ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">Choose the perfect plan for your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Individual Plan */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 hover:bg-white/10 transition-all relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black mb-2">Individual</h3>
                <p className="text-gray-400 mb-6 sm:mb-8">Your personal AI meeting assistant.</p>

                <div className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black" style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>$14.99</span>
                    <span className="text-gray-400">per month</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-500 line-through text-lg sm:text-xl">$199</span>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black" style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>$99.99</span>
                    <span className="text-gray-400">per year</span>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#8B5CF6' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">Unlimited recordings & transcripts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#8B5CF6' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">AI summaries & actions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#8B5CF6' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">Works on mobile, desktop & tablet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#8B5CF6' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">12 language support</span>
                  </li>
                </ul>

                <a href="#download" className="block w-full bg-primary hover:bg-purple-600 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all btn-hover-effect text-center">
                  Get Started
                </a>
              </div>
            </div>

            {/* Teams Plan */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 hover:bg-white/10 transition-all relative overflow-hidden border-2 border-primary">
              {/* Launch Offer Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                Limited Launch Offer
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black mb-2">Teams</h3>
                <p className="text-gray-400 mb-6 sm:mb-8">Give your team the gift of memory.</p>

                <div className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-gray-500 line-through text-xl sm:text-2xl">$299</span>
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black" style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>$99</span>
                    <span className="text-gray-400">per month</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-500">for the entire team</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#10B981' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">Add unlimited users. No per-user pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#10B981' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">Share & collaborate on recordings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#10B981' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">Build your company knowledge base</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#10B981' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-300">Up to 10,000 minutes. Add-ons available</span>
                  </li>
                </ul>

                <a href="#download" className="block w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all btn-hover-effect text-center">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials-section" data-animate className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className={`text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4 ${visibleSections.has('testimonials-section') ? 'animate-slideInUp' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold px-2">Trusted by Professionals Worldwide</h2>
            <p className="text-lg sm:text-xl text-gray-400 px-2">See what our users are saying</p>
          </div>
          <div className="relative">
            {/* Top Gradient Overlay */}
            <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                name: 'Carlos Fernández',
                role: 'Product Manager',
                country: 'Madrid, Spain',
                text: 'MeetAI has completely changed how I run meetings. The AI summaries save me hours every week.'
              },
              {
                name: 'Emily Watson',
                role: 'Marketing Director',
                country: 'London, UK',
                text: 'The transcription accuracy is incredible. I can finally focus on the conversation instead of taking notes.'
              },
              {
                name: 'Lukas Schmidt',
                role: 'Software Engineer',
                country: 'Berlin, Germany',
                text: 'Being able to chat with AI about my recordings is a game changer. It finds details I would have missed.'
              },
              {
                name: 'Giulia Bianchi',
                role: 'Business Consultant',
                country: 'Rome, Italy',
                text: 'The multilingual support is perfect for my international clients. MeetAI understands every conversation.'
              },
              {
                name: 'Michael Chen',
                role: 'Startup Founder',
                country: 'San Francisco, US',
                text: 'Our whole team uses MeetAI. Sharing recordings and collaborating has never been easier.'
              },
              {
                name: 'Sophie Dubois',
                role: 'Project Manager',
                country: 'Paris, France',
                text: 'The folder organization keeps all my client meetings perfectly structured. Simple and powerful.'
              },
              {
                name: 'Raj Patel',
                role: 'Sales Manager',
                country: 'Mumbai, India',
                text: 'Recording client calls and getting instant summaries helps me close deals faster. Incredible tool.'
              },
              {
                name: 'Yuki Tanaka',
                role: 'UX Designer',
                country: 'Tokyo, Japan',
                text: 'The AI chat feature helps me find exact moments in user interviews. Saves so much time.'
              },
              {
                name: 'Maria Silva',
                role: 'HR Director',
                country: 'Lisbon, Portugal',
                text: 'Perfect for recording interviews and team meetings. The transcripts are always accurate.'
              },
              {
                name: 'Henrik Andersen',
                role: 'Architect',
                country: 'Copenhagen, Denmark',
                text: 'I use MeetAI for all client consultations. The search feature makes finding old discussions effortless.'
              },
              {
                name: 'Isabella Rossi',
                role: 'Journalist',
                country: 'Milan, Italy',
                text: 'As a journalist, accurate transcriptions are crucial. MeetAI delivers every single time.'
              },
              {
                name: 'James O\'Brien',
                role: 'Legal Advisor',
                country: 'Dublin, Ireland',
                text: 'The security and accuracy of MeetAI make it perfect for legal consultations. Highly recommend.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="glass rounded-3xl p-6 testimonial-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-sm font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{testimonial.name}</h3>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.country}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{testimonial.text}</p>
              </div>
            ))}
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6 md:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold px-2">Ready to Transform Your Meetings?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-2">
              Download MeetAI now and start recording smarter meetings today. Available on iOS and Android.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2 sm:pt-4">
              <a href="#" className="hover:opacity-80 transition-opacity w-full sm:w-auto flex justify-center">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on App Store"
                  className="h-12 sm:h-14"
                />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity w-full sm:w-auto flex justify-center">
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-16 sm:h-20"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="MeetAI Logo" className="w-10 h-10 rounded-lg" />
                <span className="text-2xl font-bold">MeetAI</span>
              </div>
              <p className="text-gray-400">AI-powered meeting recorder that helps you focus on what matters.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#download" className="hover:text-primary transition-colors">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="/tutorials" className="hover:text-primary transition-colors">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-gray-400">&copy; 2025 MeetAI. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Facebook">
                <FacebookIcon className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="X">
                <XIcon className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="LinkedIn">
                <LinkedInIcon className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="YouTube">
                <YouTubeIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
