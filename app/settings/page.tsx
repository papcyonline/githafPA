'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import { notificationsService, NotificationPermission } from '@/lib/notifications.service'

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [connectingGoogle, setConnectingGoogle] = useState(false)

  // Notification settings
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [notificationsSupported, setNotificationsSupported] = useState(false)
  const [reminderNotifications, setReminderNotifications] = useState(true)
  const [taskNotifications, setTaskNotifications] = useState(true)
  const [eventNotifications, setEventNotifications] = useState(true)
  const [dailyBriefing, setDailyBriefing] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      setEmail(user.email || '')
      setFullName(user.full_name || '')
      checkGoogleConnection()
    }
  }, [user, authLoading, router])

  // Check notification support and permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = notificationsService.isSupported()
      setNotificationsSupported(supported)
      if (supported) {
        setNotificationPermission(notificationsService.getPermission())
        // Register service worker
        notificationsService.registerServiceWorker()
      }
    }
  }, [])

  const handleEnableNotifications = async () => {
    const permission = await notificationsService.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      setMessage('Notifications enabled!')
      // Show test notification
      await notificationsService.showNotification({
        title: 'Notifications Enabled!',
        body: 'You will now receive reminders and updates',
      })
      setTimeout(() => setMessage(''), 3000)
    }
  }

  useEffect(() => {
    const connected = searchParams.get('google_connected')
    const error = searchParams.get('error')

    if (connected === 'true') {
      setGoogleConnected(true)
      setMessage('Google Calendar connected successfully!')
      router.replace('/settings')
    } else if (error) {
      setMessage('Failed to connect Google Calendar. Please try again.')
      router.replace('/settings')
    }
  }, [searchParams, router])

  const checkGoogleConnection = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('user_google_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single()

      setGoogleConnected(!!data)
    } catch {
      setGoogleConnected(false)
    }
  }

  const connectGoogleCalendar = async () => {
    setConnectingGoogle(true)
    try {
      const response = await fetch('/api/google/auth')
      const { authUrl } = await response.json()
      const urlWithState = `${authUrl}&state=${user?.id}`
      window.location.href = urlWithState
    } catch (error) {
      console.error('Error connecting Google:', error)
      setMessage('Failed to connect Google Calendar')
      setConnectingGoogle(false)
    }
  }

  const disconnectGoogleCalendar = async () => {
    if (!confirm('Disconnect Google Calendar?')) return
    try {
      await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', user?.id)

      setGoogleConnected(false)
      setMessage('Google Calendar disconnected')
    } catch (error) {
      console.error('Error disconnecting:', error)
      setMessage('Failed to disconnect')
    }
  }

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
      <DashboardLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
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

          {/* Notification Settings */}
          <div className="glass rounded-3xl p-6 sm:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>

            {notificationsSupported ? (
              <div className="space-y-6">
                {/* Permission Status */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      notificationPermission === 'granted'
                        ? 'bg-green-500/20'
                        : notificationPermission === 'denied'
                        ? 'bg-red-500/20'
                        : 'bg-amber-500/20'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        notificationPermission === 'granted'
                          ? 'text-green-400'
                          : notificationPermission === 'denied'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Browser Notifications</h3>
                      <p className="text-sm text-gray-400">
                        {notificationPermission === 'granted'
                          ? 'Notifications are enabled'
                          : notificationPermission === 'denied'
                          ? 'Notifications are blocked in browser settings'
                          : 'Enable notifications to get reminders'}
                      </p>
                    </div>
                  </div>

                  {notificationPermission === 'granted' ? (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-green-500/20 text-green-400 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enabled
                    </span>
                  ) : notificationPermission === 'denied' ? (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-red-500/20 text-red-400">
                      Blocked
                    </span>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-5 py-2 rounded-full font-semibold text-sm transition-all"
                    >
                      Enable
                    </button>
                  )}
                </div>

                {notificationPermission === 'granted' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Reminder Notifications</h3>
                        <p className="text-sm text-gray-400">Get notified when reminders are due</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={reminderNotifications}
                          onChange={(e) => setReminderNotifications(e.target.checked)}
                        />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary cursor-pointer"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Task Notifications</h3>
                        <p className="text-sm text-gray-400">Get notified about overdue and upcoming tasks</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={taskNotifications}
                          onChange={(e) => setTaskNotifications(e.target.checked)}
                        />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary cursor-pointer"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Event Notifications</h3>
                        <p className="text-sm text-gray-400">Get notified 15 minutes before events</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={eventNotifications}
                          onChange={(e) => setEventNotifications(e.target.checked)}
                        />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary cursor-pointer"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Daily Briefing</h3>
                        <p className="text-sm text-gray-400">Get a morning summary of your day</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={dailyBriefing}
                          onChange={(e) => setDailyBriefing(e.target.checked)}
                        />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary cursor-pointer"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-400 text-sm">
                  Notifications are not supported in your browser. Try using Chrome, Firefox, or Edge for notification support.
                </p>
              </div>
            )}
          </div>

          {/* Integrations */}
          <div className="glass rounded-3xl p-6 sm:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Integrations</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Google Calendar</h3>
                    <p className="text-sm text-gray-400">Sync reminders to your Google Calendar</p>
                  </div>
                </div>

                {googleConnected ? (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-full text-sm bg-green-500/20 text-green-400 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </span>
                    <button
                      onClick={disconnectGoogleCalendar}
                      className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectGoogleCalendar}
                    disabled={connectingGoogle}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-5 py-2 rounded-full font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {connectingGoogle ? 'Connecting...' : 'Connect'}
                  </button>
                )}
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
            <p>PAssist AI Web App v1.0.0</p>
            <p className="mt-1">© 2025 PAssist AI. All rights reserved.</p>
          </div>
      </div>
    </DashboardLayout>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <SettingsContent />
    </Suspense>
  )
}
