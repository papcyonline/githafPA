'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setFullName(user.full_name || '')
    }
  }, [user])

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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
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
              className="bg-primary hover:bg-purple-600 px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
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
          <p>MeetAI Web App v1.0.0</p>
          <p className="mt-1">© 2025 MeetAI. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
