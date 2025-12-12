'use client'

import Link from 'next/link'

const PlayCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function Tutorials() {
  const tutorials = [
    {
      title: "Getting Started with MeetAI",
      description: "Learn how to set up your account and record your first meeting in under 5 minutes.",
      duration: "4 min"
    },
    {
      title: "Recording Your First Meeting",
      description: "Step-by-step guide to capturing high-quality audio and managing recording settings.",
      duration: "6 min"
    },
    {
      title: "Understanding AI Transcription",
      description: "How MeetAI's AI transcribes your audio across 12 languages with high accuracy.",
      duration: "8 min"
    },
    {
      title: "Using AI Actions",
      description: "Discover how to generate summaries, extract key points, and create to-do lists from your recordings.",
      duration: "10 min"
    },
    {
      title: "Organizing with Folders",
      description: "Master folder organization, tagging, and search to keep your recordings accessible.",
      duration: "7 min"
    },
    {
      title: "Sharing & Collaboration",
      description: "Learn how to share recordings with team members and manage permissions.",
      duration: "9 min"
    },
    {
      title: "Chat with AI Feature",
      description: "Ask questions about your recordings and get instant insights from AI.",
      duration: "8 min"
    },
    {
      title: "Team Management Guide",
      description: "Set up your team account, add users, and build your company knowledge base.",
      duration: "12 min"
    },
    {
      title: "Advanced Search Tips",
      description: "Find exactly what you need across all your recordings with powerful search.",
      duration: "6 min"
    },
    {
      title: "Export & Integration",
      description: "Export your transcripts and integrate MeetAI with your workflow tools.",
      duration: "7 min"
    },
    {
      title: "Mobile App Best Practices",
      description: "Tips and tricks for getting the most out of MeetAI on your mobile device.",
      duration: "5 min"
    },
    {
      title: "Troubleshooting Common Issues",
      description: "Quick solutions to common problems and how to get the best performance.",
      duration: "8 min"
    }
  ]

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
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8" style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #4B5563 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Video Tutorials
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 sm:mb-12">
            Watch step-by-step video guides to master MeetAI features and boost your productivity.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tutorials.map((tutorial, index) => (
              <div key={index} className="glass rounded-2xl sm:rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <PlayCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs sm:text-sm font-semibold">
                    {tutorial.duration}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors">
                  {tutorial.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  {tutorial.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">Want More Tutorials?</h2>
            <p className="text-gray-300 mb-6 text-base sm:text-lg">
              Subscribe to our YouTube channel for the latest tips, tricks, and feature updates.
            </p>
            <a href="#" className="inline-block bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all btn-hover-effect">
              Visit YouTube Channel
            </a>
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
