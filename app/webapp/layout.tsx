'use client'

import { AuthProvider } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function WebAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.includes('/auth/')

  if (isAuthPage) {
    return <>{children}</>
  }

  return <ProtectedLayout>{children}</ProtectedLayout>
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/webapp/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="py-4 flex items-center justify-between">
            <Link href="/webapp" className="flex items-center space-x-2">
              <img src="/logo.png" alt="MeetAI" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-xl font-black">MeetAI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/webapp" className="hover:text-primary transition-colors">
                Recordings
              </Link>
              <Link href="/webapp/folders" className="hover:text-primary transition-colors">
                Folders
              </Link>
              <Link href="/webapp/settings" className="hover:text-primary transition-colors">
                Settings
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <Link href="/webapp" className="block hover:text-primary transition-colors">
                Recordings
              </Link>
              <Link href="/webapp/folders" className="block hover:text-primary transition-colors">
                Folders
              </Link>
              <Link href="/webapp/settings" className="block hover:text-primary transition-colors">
                Settings
              </Link>
              <button
                onClick={signOut}
                className="block w-full text-left hover:text-primary transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WebAppLayout>{children}</WebAppLayout>
    </AuthProvider>
  )
}
