'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      setEmail(user.email || '')
      setFullName(user.full_name || '')
    }
  }, [user, authLoading, router])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      })

      if (error) throw error

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="glass rounded-full px-4 sm:px-5 py-2 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="YoMeet Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-black">YoMeet</span>
            </Link>

            <ul className="hidden lg:flex items-center space-x-6 text-sm font-medium">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/folders" className="hover:text-primary transition-colors">Folders</Link></li>
              <li><Link href="/settings" className="hover:text-primary transition-colors">Settings</Link></li>
            </ul>

            <div className="flex items-center gap-3">
              <button onClick={signOut} className="hidden sm:block text-white hover:text-primary px-4 py-2 rounded-full font-semibold text-sm transition-colors">
                Sign Out
              </button>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-20 left-4 right-4 glass rounded-3xl p-6">
            <ul className="space-y-4">
              <li><Link href="/dashboard" className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors">Dashboard</Link></li>
              <li><Link href="/folders" className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors">Folders</Link></li>
              <li><Link href="/settings" className="block py-3 px-4 hover:bg-white/10 rounded-xl transition-colors">Settings</Link></li>
              <li><button onClick={signOut} className="block w-full text-left py-3 px-4 hover:bg-white/10 rounded-xl transition-colors">Sign Out</button></li>
            </ul>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black mb-8">
            <span className="gradient-text">Settings</span>
          </h1>

          {/* Profile Settings */}
          <div className="glass rounded-3xl p-6 sm:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>

            {message && (
              <div className={`mb-6 px-4 py-3 rounded-xl ${message.includes('success') ? 'bg-green-500/10 border border-green-500 text-green-500' : 'bg-red-500/10 border border-red-500 text-red-500'}`}>
                {message}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Recording Settings */}
          <div className="glass rounded-3xl p-6 sm:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Recording Preferences</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Auto-transcribe</h3>
                  <p className="text-sm text-gray-400">Automatically transcribe recordings after saving</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Auto-save</h3>
                  <p className="text-sm text-gray-400">Automatically save recordings to cloud</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className="glass rounded-3xl p-6 sm:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Storage</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Storage Used</span>
                  <span className="text-gray-400">Calculating...</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                Unlimited storage available on Individual plan
              </p>
            </div>
          </div>

          {/* Account Actions */}
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Account</h2>

            <div className="space-y-4">
              <button
                onClick={signOut}
                className="w-full bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full font-semibold transition-all text-left"
              >
                Sign Out
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    alert('Account deletion is not yet implemented. Please contact support.')
                  }
                }}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-full font-semibold transition-all text-left"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>YoMeet Web App v1.0.0</p>
            <p className="mt-1">© 2025 Papcy. All rights reserved.</p>
          </div>
        </div>
      </div>

      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-gray-400">&copy; 2025 YoMeet. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">A <span className="text-primary font-semibold">Papcy</span> Company</p>
        </div>
      </footer>
    </main>
  )
}
