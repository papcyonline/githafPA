'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { parseAssignmentCommand } from '@/lib/smart-assignments.service'
import { supabase } from '@/lib/supabase'
import { ENABLE_MOCK_DATA } from '@/lib/mock-data'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isResearchResult?: boolean
}

export default function FloatingAIChat() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || loading || isResearching) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')

    // Check if this is a research/assignment request (skip in demo mode)
    const assignment = !ENABLE_MOCK_DATA ? parseAssignmentCommand(userInput) : null

    if (assignment && assignment.isResearchTask && user) {
      // Handle as research request
      setIsResearching(true)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Researching "${assignment.searchQuery}"...\n\nI'll save the results to your ${assignment.saveAs}s${assignment.saveAs === 'reminder' ? ` and remind you on ${assignment.reminderDate}` : ''}.`,
      }])

      try {
        const researchResponse = await fetch('/api/smart-assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: assignment.searchQuery,
            saveAs: assignment.saveAs,
            reminderDate: assignment.reminderDate,
            reminderTime: assignment.reminderTime,
            userId: user.id,
          }),
        })

        const result = await researchResponse.json()

        if (result.success && result.content) {
          // Save to database based on saveAs type
          let savedSuccessfully = false
          const saveAs = assignment.saveAs || 'note'

          try {
            if (saveAs === 'note') {
              const { error } = await supabase.from('notes').insert({
                user_id: user.id,
                title: result.title,
                content: result.content,
              })
              savedSuccessfully = !error
            } else if (saveAs === 'reminder') {
              const { error } = await supabase.from('reminders').insert({
                user_id: user.id,
                title: result.title,
                description: result.content,
                reminder_date: assignment.reminderDate || new Date().toISOString().split('T')[0],
                reminder_time: assignment.reminderTime || '09:00',
              })
              savedSuccessfully = !error
            } else if (saveAs === 'task') {
              const { error } = await supabase.from('tasks').insert({
                user_id: user.id,
                title: result.title,
                description: result.content,
                priority: 'medium',
                completed: false,
              })
              savedSuccessfully = !error
            }

            if (savedSuccessfully) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `**Research Complete!**\n\n**${result.title}**\n\n${result.content.substring(0, 300)}${result.content.length > 300 ? '...' : ''}\n\nSaved to your ${saveAs}s. [View ${saveAs} →](/${saveAs}s)`,
                isResearchResult: true,
              }])

              // Show browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Research Complete!', {
                  body: `"${result.title}" saved to ${saveAs}s`,
                  icon: '/logo.png',
                })
              }
            } else {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `**Research Complete!**\n\n**${result.title}**\n\n${result.content.substring(0, 300)}${result.content.length > 300 ? '...' : ''}\n\nCould not save to ${saveAs}s automatically.`,
                isResearchResult: true,
              }])
            }
          } catch (saveError) {
            console.error('Save error:', saveError)
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `**Research Complete!**\n\n**${result.title}**\n\n${result.content}\n\nCould not save automatically. Please copy the results.`,
              isResearchResult: true,
            }])
          }
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Sorry, I couldn't complete the research. ${result.error || 'Please try again.'}`,
          }])
        }
      } catch (error) {
        console.error('Research error:', error)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, something went wrong with the research. Please try again.',
        }])
      } finally {
        setIsResearching(false)
      }
      return
    }

    // Regular chat message
    setLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          title="Chat with AI"
        >
          <svg
            className="w-7 h-7 text-white group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold">AI Assistant</h3>
                <p className="text-white/80 text-xs">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-bold mb-2">Hi! I'm PAssist</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Your personal assistant with access to all your data. Ask me anything!
                </p>

                <div className="grid grid-cols-1 gap-2 w-full">
                  <button
                    onClick={() => setInput('What recordings do I have?')}
                    className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-left border border-purple-200 transition-all text-sm"
                  >
                    <div className="text-gray-900 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      View my recordings
                    </div>
                    <div className="text-gray-500 text-xs">See all your audio notes</div>
                  </button>
                  <button
                    onClick={() => setInput('What are my upcoming tasks and reminders?')}
                    className="p-3 bg-green-50 hover:bg-green-100 rounded-xl text-left border border-green-200 transition-all text-sm"
                  >
                    <div className="text-gray-900 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Check my schedule
                    </div>
                    <div className="text-gray-500 text-xs">Tasks, reminders & events</div>
                  </button>
                  <button
                    onClick={() => setInput('How am I doing financially?')}
                    className="p-3 bg-amber-50 hover:bg-amber-100 rounded-xl text-left border border-amber-200 transition-all text-sm"
                  >
                    <div className="text-gray-900 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Financial overview
                    </div>
                    <div className="text-gray-500 text-xs">Income, expenses & budgets</div>
                  </button>
                  <button
                    onClick={() => setInput('Find me the cheapest hotels in Dubai and save to notes')}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-left border border-gray-200 transition-all text-sm"
                  >
                    <div className="text-gray-900 font-semibold">Research anything</div>
                    <div className="text-gray-500 text-xs">I'll find info and save it for you</div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl shadow-sm">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-gray-900 placeholder-gray-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
