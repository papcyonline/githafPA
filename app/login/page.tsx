'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="glass rounded-full px-4 sm:px-5 py-2 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="PAssist AI Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-black">PAssist AI</span>
            </Link>
            <Link href="/" className="text-sm sm:text-base hover:text-primary transition-colors">
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 gradient-text">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue to PAssist AI</p>
          </div>

          <div className="glass rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">Or continue with</span>
                </div>
              </div>

              <button
                onClick={signInWithGoogle}
                className="mt-4 w-full glass px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                Continue with Google
              </button>
            </div>

            <p className="mt-6 text-center text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-purple-400">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
