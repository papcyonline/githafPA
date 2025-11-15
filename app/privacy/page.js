'use client'

import Link from 'next/link'

export default function Privacy() {
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
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-gray-400 mb-8">Last updated: January 2025</p>

          <div className="space-y-6 sm:space-y-8 text-base sm:text-lg text-gray-300 leading-relaxed">
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Introduction</h2>
              <p>
                At YoMeet, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
              </p>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Information We Collect</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl flex-shrink-0">•</span>
                  <div>
                    <strong className="text-white">Audio Recordings:</strong> We store your meeting recordings securely to provide transcription and AI analysis services.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl flex-shrink-0">•</span>
                  <div>
                    <strong className="text-white">Account Information:</strong> Email address, name, and profile information you provide.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl flex-shrink-0">•</span>
                  <div>
                    <strong className="text-white">Usage Data:</strong> Information about how you use our app and services.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl flex-shrink-0">•</span>
                  <div>
                    <strong className="text-white">Device Information:</strong> Device type, operating system, and unique device identifiers.
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">How We Use Your Information</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Provide and maintain our services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Process and transcribe your audio recordings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Generate AI summaries and insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Improve our services and develop new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Communicate with you about updates and support</span>
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data, including encryption at rest and in transit. Your recordings and transcripts are stored securely and are only accessible to you and users you explicitly share them with.
              </p>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Access your personal data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Request correction of inaccurate data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Request deletion of your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Export your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span>Opt-out of marketing communications</span>
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@yomeet.com" className="text-primary hover:text-purple-400 transition-colors">
                  privacy@yomeet.com
                </a>
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
