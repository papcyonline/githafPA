/**
 * Smart Assignments Service
 * Handles AI-powered research tasks and assignments
 *
 * Example commands:
 * - "Find me the cheapest hotels in Dubai and save to notes"
 * - "Research best restaurants in NYC and remind me tomorrow"
 * - "Look up flight prices to Paris and create a note"
 */

import { supabase } from './supabase'

export interface SmartAssignment {
  id: string
  user_id: string
  query: string
  status: 'pending' | 'researching' | 'completed' | 'failed'
  result_type: 'note' | 'reminder' | 'task'
  result_id?: string
  research_data?: string
  created_at: string
  completed_at?: string
}

export interface AssignmentRequest {
  query: string
  saveAs: 'note' | 'reminder' | 'task'
  reminderDate?: string
  reminderTime?: string
  notify?: boolean
}

export interface ParsedAssignment {
  isResearchTask: boolean
  searchQuery: string
  saveAs: 'note' | 'reminder' | 'task'
  reminderDate?: string
  reminderTime?: string
  title: string
}

/**
 * Parse a voice command to detect if it's a research/assignment task
 */
export function parseAssignmentCommand(transcript: string): ParsedAssignment | null {
  const lowerTranscript = transcript.toLowerCase()

  // Keywords that indicate a research task
  const researchKeywords = [
    'find me', 'find', 'search for', 'search', 'look up', 'look for',
    'research', 'get me', 'show me', 'what are', "what's the",
    'cheapest', 'best', 'top', 'compare', 'prices for'
  ]

  // Keywords that indicate where to save
  const noteKeywords = ['save to notes', 'add to notes', 'create a note', 'make a note', 'note it', 'save as note']
  const reminderKeywords = ['remind me', 'set a reminder', 'create reminder', 'save as reminder', 'notify me']
  const taskKeywords = ['add to tasks', 'create a task', 'save as task', 'add to my tasks']

  // Check if this is a research task
  const isResearchTask = researchKeywords.some(keyword => lowerTranscript.includes(keyword))

  if (!isResearchTask) {
    return null
  }

  // Determine where to save
  let saveAs: 'note' | 'reminder' | 'task' = 'note' // Default to note

  if (reminderKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    saveAs = 'reminder'
  } else if (taskKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    saveAs = 'task'
  } else if (noteKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    saveAs = 'note'
  }

  // Extract the search query by removing action words
  let searchQuery = transcript

  // Remove common prefixes
  const prefixPatterns = [
    /^(can you |please |could you |)/i,
    /^(find me |find |search for |search |look up |look for |research |get me |show me )/i,
    /^(the |)/i,
  ]

  prefixPatterns.forEach(pattern => {
    searchQuery = searchQuery.replace(pattern, '')
  })

  // Remove save instructions
  const suffixPatterns = [
    /(and |then )?(save to notes|add to notes|create a note|make a note|note it|save as note)/i,
    /(and |then )?(remind me|set a reminder|create reminder|save as reminder|notify me)( tomorrow| later| next week)?/i,
    /(and |then )?(add to tasks|create a task|save as task|add to my tasks)/i,
  ]

  suffixPatterns.forEach(pattern => {
    searchQuery = searchQuery.replace(pattern, '')
  })

  searchQuery = searchQuery.trim()

  // Parse reminder date if mentioned
  let reminderDate: string | undefined
  let reminderTime: string | undefined

  if (saveAs === 'reminder') {
    const today = new Date()

    if (lowerTranscript.includes('tomorrow')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      reminderDate = tomorrow.toISOString().split('T')[0]
      reminderTime = '09:00'
    } else if (lowerTranscript.includes('next week')) {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      reminderDate = nextWeek.toISOString().split('T')[0]
      reminderTime = '09:00'
    } else {
      // Default to tomorrow
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      reminderDate = tomorrow.toISOString().split('T')[0]
      reminderTime = '09:00'
    }
  }

  // Generate a title
  const title = searchQuery.length > 50
    ? searchQuery.substring(0, 47) + '...'
    : searchQuery

  return {
    isResearchTask: true,
    searchQuery,
    saveAs,
    reminderDate,
    reminderTime,
    title: `Research: ${title}`,
  }
}

/**
 * Create a smart assignment (stored in DB for tracking)
 */
export async function createAssignment(request: AssignmentRequest): Promise<SmartAssignment | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('smart_assignments')
    .insert({
      user_id: user.id,
      query: request.query,
      status: 'pending',
      result_type: request.saveAs,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating assignment:', error)
    return null
  }

  return data
}

/**
 * Update assignment with research results
 */
export async function completeAssignment(
  assignmentId: string,
  researchData: string,
  resultId: string
): Promise<void> {
  await supabase
    .from('smart_assignments')
    .update({
      status: 'completed',
      research_data: researchData,
      result_id: resultId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
}

/**
 * Get user's assignments
 */
export async function getUserAssignments(status?: SmartAssignment['status']): Promise<SmartAssignment[]> {
  let query = supabase
    .from('smart_assignments')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching assignments:', error)
    return []
  }

  return data || []
}

export const smartAssignmentsService = {
  parseAssignmentCommand,
  createAssignment,
  completeAssignment,
  getUserAssignments,
}
