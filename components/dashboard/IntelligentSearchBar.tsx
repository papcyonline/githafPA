'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  entity_type: string
  entity_id: string
  title: string
  content: string | null
  created_at: string
}

const entityIcons: Record<string, string> = {
  task: '✓',
  note: '📝',
  reminder: '⏰',
  recording: '🎙️',
  event: '📅',
  goal: '🎯',
  email: '✉️',
  document: '📄',
}

const entityUrls: Record<string, (id: string) => string> = {
  task: () => '/dashboard',
  note: () => '/notes',
  reminder: () => '/reminders',
  recording: (id) => `/recording/${id}`,
  event: () => '/calendar',
  goal: () => '/goals',
  email: () => '/email',
  document: () => '/documents',
}

export function IntelligentSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        try {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, filters: { limit: 10 } }),
          })
          const data = await response.json()
          setResults(data.results || [])
          setIsOpen(true)
          setSelectedIndex(0)
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          navigateToResult(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setQuery('')
        break
    }
  }

  const navigateToResult = (result: SearchResult) => {
    const urlFn = entityUrls[result.entity_type]
    if (urlFn) {
      router.push(urlFn(result.entity_id))
    }
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search tasks, notes, recordings, events..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => navigateToResult(result)}
                className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-white/5 transition-colors ${
                  index === selectedIndex ? 'bg-white/10' : ''
                }`}
              >
                <span className="text-xl">{entityIcons[result.entity_type] || '📎'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{result.title}</span>
                    <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-white/5 rounded">
                      {result.entity_type}
                    </span>
                  </div>
                  {result.content && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {result.content.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 px-4 py-2 bg-white/5">
            <p className="text-xs text-gray-500">
              Press ↑↓ to navigate, Enter to select, Esc to close
            </p>
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl p-4 text-center text-gray-400 z-50">
          No results found for "{query}"
        </div>
      )}
    </div>
  )
}
