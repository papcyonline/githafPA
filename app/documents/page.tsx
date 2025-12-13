'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { format } from 'date-fns'
import DashboardLayout from '@/components/DashboardLayout'
import AudioRecorder from '@/components/AudioRecorder'

interface DocumentTemplate {
  id: string
  template_type: string
  name: string
  description: string | null
  content: string
  variables: { name: string; label: string; type: string }[] | null
  is_default: boolean
}

interface GeneratedDocument {
  id: string
  document_type: string
  title: string
  content: string
  created_at: string
}

const DocumentTypeIcon = ({ type, className = "w-6 h-6" }: { type: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    proposal: (
      <svg className={`${className} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    report: (
      <svg className={`${className} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    sop: (
      <svg className={`${className} text-purple-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    meeting_notes: (
      <svg className={`${className} text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    contract: (
      <svg className={`${className} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    email: (
      <svg className={`${className} text-cyan-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  }
  return icons[type] || (
    <svg className={`${className} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

const TEMPLATE_TYPES: Record<string, { label: string; color: string }> = {
  proposal: { label: 'Proposal', color: 'bg-blue-500/20 text-blue-400' },
  report: { label: 'Report', color: 'bg-green-500/20 text-green-400' },
  sop: { label: 'SOP', color: 'bg-purple-500/20 text-purple-400' },
  meeting_notes: { label: 'Meeting Notes', color: 'bg-amber-500/20 text-amber-400' },
  contract: { label: 'Contract', color: 'bg-red-500/20 text-red-400' },
  email: { label: 'Email', color: 'bg-cyan-500/20 text-cyan-400' },
}

export default function DocumentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [documents, setDocuments] = useState<GeneratedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'documents' | 'templates'>('documents')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [viewingDocument, setViewingDocument] = useState<GeneratedDocument | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [docsRes, templatesRes] = await Promise.all([
        fetch('/api/documents?resource=documents'),
        fetch('/api/documents?resource=templates'),
      ])
      const docsData = await docsRes.json()
      const templatesData = await templatesRes.json()
      setDocuments(docsData.documents || [])
      setTemplates(templatesData.templates || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedTemplate) return
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          variables: variableValues,
          user_id: user?.id,
        }),
      })
      if (response.ok) {
        setShowGenerateModal(false)
        setSelectedTemplate(null)
        setVariableValues({})
        fetchData()
      }
    } catch (error) {
      console.error('Failed to generate document:', error)
    }
  }

  const handleDelete = async (id: string, resource: 'document' | 'template') => {
    if (!confirm(`Delete this ${resource}?`)) return
    try {
      await fetch(`/api/documents?id=${id}&resource=${resource}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error(`Failed to delete ${resource}:`, error)
    }
  }

  const openGenerateModal = (template: DocumentTemplate) => {
    setSelectedTemplate(template)
    const defaultValues: Record<string, string> = {}
    template.variables?.forEach(v => {
      defaultValues[v.name] = ''
    })
    setVariableValues(defaultValues)
    setShowGenerateModal(true)
  }

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Documents</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecorder(true)}
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Record document request"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Record</span>
            </button>
            <button
              onClick={() => setShowAIPrompt(true)}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Ask AI to create document"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'documents' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'
            }`}
          >
            My Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'templates' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'
            }`}
          >
            Templates ({templates.length})
          </button>
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const type = TEMPLATE_TYPES[doc.document_type as keyof typeof TEMPLATE_TYPES] || TEMPLATE_TYPES.report
              return (
                <div
                  key={doc.id}
                  className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setViewingDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <DocumentTypeIcon type={doc.document_type} className="w-7 h-7" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, 'document') }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="font-medium truncate">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${type.color}`}>
                      {type.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                    {doc.content.substring(0, 100)}...
                  </p>
                </div>
              )
            })}

            {documents.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <div className="flex justify-center mb-4">
                  <DocumentTypeIcon type="report" className="w-12 h-12" />
                </div>
                <p>No documents yet. Generate one from a template!</p>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const type = TEMPLATE_TYPES[template.template_type as keyof typeof TEMPLATE_TYPES] || TEMPLATE_TYPES.report
              return (
                <div
                  key={template.id}
                  className="bg-white/5 rounded-xl p-5 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <DocumentTypeIcon type={template.template_type} className="w-7 h-7" />
                    {template.is_default && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                        Default
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium">{template.name}</h3>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded mt-2 ${type.color}`}>
                    {type.label}
                  </span>
                  {template.description && (
                    <p className="text-sm text-gray-400 mt-3">{template.description}</p>
                  )}
                  {template.variables && template.variables.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map(v => (
                        <span key={v.name} className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
                          {v.label}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-xs text-gray-500">+{template.variables.length - 3} more</span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => openGenerateModal(template)}
                    className="mt-4 w-full bg-purple-500/20 text-purple-400 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              )
            })}

            {templates.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <div className="flex justify-center mb-4">
                  <DocumentTypeIcon type="proposal" className="w-12 h-12" />
                </div>
                <p>No templates yet. Create your first template!</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Generate Document Modal */}
      {showGenerateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Generate: {selectedTemplate.name}</h2>
            <div className="space-y-4">
              {selectedTemplate.variables?.map((variable) => (
                <div key={variable.name}>
                  <label className="block text-sm text-gray-400 mb-1">{variable.label}</label>
                  {variable.type === 'textarea' ? (
                    <textarea
                      value={variableValues[variable.name] || ''}
                      onChange={(e) => setVariableValues(v => ({ ...v, [variable.name]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-24"
                    />
                  ) : (
                    <input
                      type={variable.type === 'date' ? 'date' : 'text'}
                      value={variableValues[variable.name] || ''}
                      onChange={(e) => setVariableValues(v => ({ ...v, [variable.name]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowGenerateModal(false); setSelectedTemplate(null) }}
                  className="flex-1 bg-white/5 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 bg-purple-500 py-2 rounded-lg"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-3xl mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">{viewingDocument.title}</h2>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-white/5 p-4 rounded-lg">
                {viewingDocument.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Audio Recorder Modal */}
      {showRecorder && (
        <AudioRecorder
          onClose={() => setShowRecorder(false)}
          onRecordingComplete={fetchData}
          context="documents"
          contextHint="Describe the document you want to create or manage"
        />
      )}

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Document with AI</h2>
              <button
                onClick={() => setShowAIPrompt(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formElement = e.target as HTMLFormElement
              const input = (formElement.elements.namedItem('aiInput') as HTMLInputElement).value

              // TODO: Send to AI service to parse and create document
              console.log('AI Input:', input)
              setShowAIPrompt(false)
              fetchData()
            }}>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Describe the document you want to create
                </label>
                <textarea
                  name="aiInput"
                  placeholder="e.g., 'Create a project proposal for a mobile app development' or 'Generate meeting notes template for weekly standups'"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  The AI will automatically create the appropriate document
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAIPrompt(false)}
                  className="flex-1 bg-white/5 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
