'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth-context'
import DashboardLayout from '@/components/DashboardLayout'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatAIPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
      <div className="flex flex-col h-full">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A855F7] to-[#10B981] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black">AI Assistant</h1>
                <p className="text-xs text-gray-400">Powered by GPT-4</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Clear Chat
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#A855F7] to-[#10B981] flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black mb-2">How can I help you today?</h2>
                <p className="text-gray-400 mb-8">Ask me anything about your recordings or notes</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                  <button
                    onClick={() => setInput('Summarize my recent recordings')}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/10 transition-all"
                  >
                    <div className="font-semibold mb-1">Summarize recordings</div>
                    <div className="text-sm text-gray-400">Get insights from your audio</div>
                  </button>
                  <button
                    onClick={() => setInput('Help me organize my notes')}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/10 transition-all"
                  >
                    <div className="font-semibold mb-1">Organize notes</div>
                    <div className="text-sm text-gray-400">Get organization tips</div>
                  </button>
                  <button
                    onClick={() => setInput('Create a task list from my notes')}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/10 transition-all"
                  >
                    <div className="font-semibold mb-1">Create task list</div>
                    <div className="text-sm text-gray-400">Extract actionable items</div>
                  </button>
                  <button
                    onClick={() => setInput('Analyze my productivity patterns')}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/10 transition-all"
                  >
                    <div className="font-semibold mb-1">Productivity insights</div>
                    <div className="text-sm text-gray-400">Understand your habits</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#A855F7] to-[#10B981] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-[#A855F7] text-white'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#A855F7] flex items-center justify-center font-bold">
                        {user?.email?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#A855F7] to-[#10B981] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#A855F7] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-[#A855F7] hover:bg-[#9333EA] rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
      </div>
    </DashboardLayout>
  )
}
