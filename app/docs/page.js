'use client'

import Link from 'next/link'

export default function Documentation() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="glass rounded-full px-4 sm:px-5 py-2 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="MeetAI Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-black">MeetAI</span>
            </Link>
            <Link href="/" className="text-sm sm:text-base hover:text-primary transition-colors">
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8" style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Documentation
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 sm:mb-12">
            Complete guide to using MeetAI features and capabilities.
          </p>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">Quick Start Guide</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Get up and running with MeetAI in minutes. Learn the basics of recording, transcription, and AI features.
              </p>
            </Link>

            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">Recording Features</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Master audio recording with one-tap start, unlimited length, and high-quality capture options.
              </p>
            </Link>

            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">Transcription & Languages</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Learn how automatic transcription works across 12 languages with high accuracy and speaker identification.
              </p>
            </Link>

            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">AI Actions</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Discover all AI-powered features: summaries, key points extraction, to-do lists, and translations.
              </p>
            </Link>

            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">Organization & Folders</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Keep your recordings organized with custom folders, tags, and powerful search capabilities.
              </p>
            </Link>

            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">Sharing & Collaboration</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Share recordings with team members, collaborate on notes, and manage permissions effectively.
              </p>
            </Link>

            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">AI Chat</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Use AI chat to ask questions about your recordings and get instant insights from your meeting history.
              </p>
            </Link>

            <Link href="#" className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">Teams Guide</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Set up and manage your team account, add users, and build your company knowledge base.
              </p>
            </Link>
          </div>

          <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Need More Help?</h2>
            <p className="text-gray-300 mb-6 text-base sm:text-lg">
              Visit our Help Center for FAQs and troubleshooting guides.
            </p>
            <Link href="/help" className="inline-block bg-primary hover:bg-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all btn-hover-effect">
              Go to Help Center
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2025 MeetAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
