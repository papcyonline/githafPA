'use client'

import Link from 'next/link'

export default function Help() {
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
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8" style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Help Center
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 sm:mb-12">
            Find answers to common questions and learn how to get the most out of YoMeet.
          </p>

          <div className="space-y-6 sm:space-y-8">
            {/* Getting Started */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Getting Started</h2>
              <div className="space-y-4">
                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">How do I create an account?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    Download the YoMeet app from the App Store or Google Play, open it, and follow the sign-up process. You can sign up using your email address or social media accounts.
                  </p>
                </details>

                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">How do I start my first recording?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    Simply tap the large record button on the main screen. Grant microphone permissions when prompted, and your recording will begin immediately.
                  </p>
                </details>

                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">Is there a recording time limit?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    No! YoMeet supports unlimited recording length. Record as long as you need without worrying about time limits.
                  </p>
                </details>
              </div>
            </div>

            {/* Features */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Features</h2>
              <div className="space-y-4">
                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">How accurate is the transcription?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    YoMeet uses advanced AI to provide highly accurate transcriptions. Accuracy improves with clear audio and minimal background noise. We support 12 languages with native speaker-level accuracy.
                  </p>
                </details>

                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">What AI actions are available?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    YoMeet can summarize your meetings, extract main points, generate to-do lists, and translate transcripts. More AI features are being added regularly.
                  </p>
                </details>

                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">Can I chat with AI about my recordings?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    Yes! Use the AI Chat feature to ask questions about your recordings. The AI can find specific moments, summarize sections, and provide insights based on your meeting content.
                  </p>
                </details>
              </div>
            </div>

            {/* Account & Billing */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Account & Billing</h2>
              <div className="space-y-4">
                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">What's included in the Individual plan?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    The Individual plan ($14.99/month or $99.99/year) includes unlimited recordings, AI transcription in 12 languages, AI summaries and actions, and works on all your devices.
                  </p>
                </details>

                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">How does Teams pricing work?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    Teams pricing is $99/month for your entire team with unlimited users. No per-user charges. Includes up to 10,000 minutes with add-ons available for more.
                  </p>
                </details>

                <details className="glass rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all">
                  <summary className="font-semibold text-base sm:text-lg text-white">Can I cancel my subscription anytime?</summary>
                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.
                  </p>
                </details>
              </div>
            </div>

            {/* Still need help? */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Still need help?</h2>
              <p className="text-gray-300 mb-6 text-base sm:text-lg">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link href="/contact" className="inline-block bg-primary hover:bg-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all btn-hover-effect">
                Contact Support
              </Link>
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
