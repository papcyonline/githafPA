'use client'

import Link from 'next/link'

export default function Contact() {
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
            Contact Us
          </h1>

          <div className="space-y-6 sm:space-y-8">
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              Have questions or feedback? We'd love to hear from you. Reach out to our team and we'll get back to you as soon as possible.
            </p>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Get in Touch</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Email Support</h3>
                  <a href="mailto:support@yomeet.com" className="text-primary hover:text-purple-400 transition-colors text-base sm:text-lg">
                    support@yomeet.com
                  </a>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Sales Inquiries</h3>
                  <a href="mailto:sales@yomeet.com" className="text-primary hover:text-purple-400 transition-colors text-base sm:text-lg">
                    sales@yomeet.com
                  </a>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">General Inquiries</h3>
                  <a href="mailto:hello@yomeet.com" className="text-primary hover:text-purple-400 transition-colors text-base sm:text-lg">
                    hello@yomeet.com
                  </a>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Follow Us</h2>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="glass px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm sm:text-base">
                  Facebook
                </a>
                <a href="#" className="glass px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm sm:text-base">
                  Instagram
                </a>
                <a href="#" className="glass px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm sm:text-base">
                  X (Twitter)
                </a>
                <a href="#" className="glass px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm sm:text-base">
                  LinkedIn
                </a>
                <a href="#" className="glass px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm sm:text-base">
                  YouTube
                </a>
              </div>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Business Hours</h2>
              <p className="text-gray-300 text-base sm:text-lg">
                Monday - Friday: 9:00 AM - 6:00 PM (EST)<br />
                Saturday - Sunday: Closed
              </p>
              <p className="text-gray-400 text-sm sm:text-base mt-4">
                * Email support is available 24/7. We typically respond within 24 hours.
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
