'use client'

import Link from 'next/link'

export default function About() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="glass rounded-full px-4 sm:px-5 py-2 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="YoMeet Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-black">YoMeet</span>
            </Link>
            <Link href="/" className="text-sm sm:text-base hover:text-primary transition-colors">
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8" style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            About YoMeet
          </h1>

          <div className="space-y-6 sm:space-y-8 text-base sm:text-lg text-gray-300 leading-relaxed">
            <p>
              YoMeet is an AI-powered meeting recorder and note-taking app designed to help professionals capture, transcribe, and organize their meetings effortlessly.
            </p>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Our Mission</h2>
              <p>
                We believe that everyone deserves to focus on what matters most in their meetings - the conversation and ideas - not frantically taking notes. YoMeet transforms hours of recordings into actionable insights in seconds, powered by advanced AI technology.
              </p>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">What We Do</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Record meetings with one tap and unlimited length</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Automatically transcribe audio to text in 12 languages</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Generate AI summaries, action items, and key insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Organize recordings in folders and share with your team</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Chat with AI about your recordings anytime</span>
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">A Papcy Company</h2>
              <p>
                YoMeet is proudly developed by Papcy, a company dedicated to building innovative tools that enhance productivity and collaboration for professionals worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2025 YoMeet. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-2">A <span className="text-primary font-semibold">Papcy</span> Company</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
