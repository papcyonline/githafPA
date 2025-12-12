'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import { supabase, Folder } from '../../lib/supabase'

export default function FoldersPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('#A855F7')
  const [creating, setCreating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const colors = [
    '#A855F7', '#EC4899', '#F59E0B', '#10B981',
    '#3B82F6', '#EF4444', '#8B5CF6', '#14B8A6',
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchFolders()
    }
  }, [user, authLoading, router])

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*, recordings(count)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFolders(data || [])
    } catch (error) {
      console.error('Error fetching folders:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    setCreating(true)
    try {
      const { error } = await supabase
        .from('folders')
        .insert({
          user_id: user?.id,
          name: newFolderName.trim(),
          color: newFolderColor,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      await fetchFolders()
      setShowModal(false)
      setNewFolderName('')
      setNewFolderColor('#A855F7')
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder')
    } finally {
      setCreating(false)
    }
  }

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder? Recordings inside will not be deleted.')) return

    try {
      await supabase
        .from('recordings')
        .update({ folder_id: null })
        .eq('folder_id', folderId)

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)

      if (error) throw error
      await fetchFolders()
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Failed to delete folder')
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
              <img src="/logo.png" alt="MeetAI Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-black">MeetAI</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">
                <span className="gradient-text">Folders</span>
              </h1>
              <p className="text-gray-400">
                {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
              </p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 rounded-full font-semibold transition-all inline-flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Folder</span>
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="glass rounded-3xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-black mb-6">
                  <span className="gradient-text">Create New Folder</span>
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Folder Name</label>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g., Work Meetings"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <div className="grid grid-cols-4 gap-3">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewFolderColor(color)}
                          className={`w-full aspect-square rounded-xl transition-all ${newFolderColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button onClick={() => { setShowModal(false); setNewFolderName(''); setNewFolderColor('#A855F7'); }} disabled={creating} className="flex-1 glass px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all disabled:opacity-50">
                      Cancel
                    </button>
                    <button onClick={createFolder} disabled={creating || !newFolderName.trim()} className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50">
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-400">Loading folders...</p>
            </div>
          ) : folders.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold mb-2">No folders yet</h3>
              <p className="text-gray-400 mb-6">Create folders to organize your recordings</p>
              <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-purple-600 px-6 py-3 rounded-full font-semibold transition-all">
                Create Your First Folder
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map((folder: any) => (
                <div key={folder.id} className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: folder.color }}>
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <button onClick={() => deleteFolder(folder.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-all">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{folder.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {folder.recordings?.[0]?.count || 0} recordings
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-gray-400">&copy; 2025 MeetAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
