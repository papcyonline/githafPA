import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { serverSupabase } from '@/lib/api/auth'

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Fetch user's data if userId is provided
    let userContext = ''
    if (userId) {
      try {
        const today = new Date().toISOString().split('T')[0]

        // Fetch user's comprehensive data in parallel
        const [
          recordingsRes,
          tasksRes,
          remindersRes,
          notesRes,
          eventsRes,
          financialRes,
          budgetsRes,
          goalsRes,
          habitsRes,
          lifeTasksRes,
          personalEventsRes,
          checkinsRes,
          documentsRes,
        ] = await Promise.all([
          // Recordings
          serverSupabase
            .from('recordings')
            .select('title, created_at, transcript')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5),
          // Tasks
          serverSupabase
            .from('tasks')
            .select('title, completed, due_date, priority')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
          // Reminders
          serverSupabase
            .from('reminders')
            .select('title, reminder_date, reminder_time, description')
            .eq('user_id', userId)
            .gte('reminder_date', today)
            .order('reminder_date', { ascending: true })
            .limit(10),
          // Notes
          serverSupabase
            .from('notes')
            .select('title, content')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(5),
          // Calendar Events
          serverSupabase
            .from('calendar_events')
            .select('title, start_time, end_time, description')
            .eq('user_id', userId)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(10),
          // Financial Entries (recent)
          serverSupabase
            .from('financial_entries')
            .select('entry_type, amount, category, description, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10),
          // Financial Budgets
          serverSupabase
            .from('financial_budgets')
            .select('category, amount, period')
            .eq('user_id', userId)
            .eq('is_active', true),
          // Goals
          serverSupabase
            .from('goals')
            .select('title, target_date, progress, status')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5),
          // Habits
          serverSupabase
            .from('habits')
            .select('name, frequency, current_streak')
            .eq('user_id', userId)
            .eq('is_active', true)
            .limit(10),
          // Life Tasks
          serverSupabase
            .from('life_tasks')
            .select('title, category, due_date, next_due_at')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('next_due_at', { ascending: true })
            .limit(10),
          // Personal Events
          serverSupabase
            .from('personal_events')
            .select('title, event_type, event_date, person_name')
            .eq('user_id', userId)
            .gte('event_date', today)
            .order('event_date', { ascending: true })
            .limit(10),
          // Daily Check-ins (recent)
          serverSupabase
            .from('daily_checkins')
            .select('checkin_date, mood_score, energy_level, stress_level')
            .eq('user_id', userId)
            .order('checkin_date', { ascending: false })
            .limit(3),
          // Generated Documents
          serverSupabase
            .from('generated_documents')
            .select('title, document_type, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        // Log any errors in fetching data
        console.log('AI Chat - Fetching data for user:', userId)
        if (recordingsRes.error) console.error('Recordings error:', recordingsRes.error)
        if (tasksRes.error) console.error('Tasks error:', tasksRes.error)
        if (remindersRes.error) console.error('Reminders error:', remindersRes.error)
        if (notesRes.error) console.error('Notes error:', notesRes.error)

        // Log data counts
        console.log('Data fetched:', {
          recordings: recordingsRes.data?.length || 0,
          tasks: tasksRes.data?.length || 0,
          reminders: remindersRes.data?.length || 0,
          notes: notesRes.data?.length || 0,
        })

        // Build context from user data
        const contextParts = []

        // Recordings
        if (recordingsRes.data && recordingsRes.data.length > 0) {
          contextParts.push(`\n**Recordings (${recordingsRes.data.length} recent):**\n${recordingsRes.data.map(r =>
            `- "${r.title}" (${new Date(r.created_at).toLocaleDateString()})`
          ).join('\n')}`)
        } else {
          contextParts.push(`\n**Recordings:** No recordings found`)
        }

        // Tasks
        if (tasksRes.data && tasksRes.data.length > 0) {
          const incompleteTasks = tasksRes.data.filter(t => !t.completed)
          const completedTasks = tasksRes.data.filter(t => t.completed)
          if (incompleteTasks.length > 0) {
            contextParts.push(`\n**Active Tasks (${incompleteTasks.length}):**\n${incompleteTasks.map(t =>
              `- ${t.title}${t.due_date ? ` (due: ${t.due_date})` : ''} [${t.priority}]`
            ).join('\n')}`)
          } else {
            contextParts.push(`\n**Active Tasks:** No active tasks`)
          }
          if (completedTasks.length > 0) {
            contextParts.push(`\n**Completed Tasks (${completedTasks.length}):**\n${completedTasks.slice(0, 3).map(t =>
              `- ${t.title}`
            ).join('\n')}`)
          }
        } else {
          contextParts.push(`\n**Tasks:** No tasks found`)
        }

        // Reminders
        if (remindersRes.data && remindersRes.data.length > 0) {
          contextParts.push(`\n**Upcoming Reminders (${remindersRes.data.length}):**\n${remindersRes.data.map(r =>
            `- "${r.title}" on ${r.reminder_date} at ${r.reminder_time}`
          ).join('\n')}`)
        } else {
          contextParts.push(`\n**Reminders:** No upcoming reminders`)
        }

        // Notes
        if (notesRes.data && notesRes.data.length > 0) {
          contextParts.push(`\n**Recent Notes (${notesRes.data.length}):**\n${notesRes.data.map(n =>
            `- "${n.title}"`
          ).join('\n')}`)
        }

        // Calendar Events
        if (eventsRes.data && eventsRes.data.length > 0) {
          contextParts.push(`\n**Upcoming Calendar Events (${eventsRes.data.length}):**\n${eventsRes.data.map(e =>
            `- "${e.title}" on ${new Date(e.start_time).toLocaleString()}`
          ).join('\n')}`)
        }

        // Financial Overview
        if (financialRes.data && financialRes.data.length > 0) {
          const income = financialRes.data.filter(f => f.entry_type === 'income')
          const expenses = financialRes.data.filter(f => f.entry_type === 'expense')
          const totalIncome = income.reduce((sum, e) => sum + Number(e.amount), 0)
          const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

          contextParts.push(`\n**Recent Financial Activity:**\n- Total Income: $${totalIncome.toFixed(2)}\n- Total Expenses: $${totalExpenses.toFixed(2)}\n- Recent Transactions: ${financialRes.data.slice(0, 5).map(f =>
            `${f.entry_type === 'income' ? '+' : '-'}$${f.amount} (${f.category})`
          ).join(', ')}`)
        }

        // Budgets
        if (budgetsRes.data && budgetsRes.data.length > 0) {
          contextParts.push(`\n**Active Budgets (${budgetsRes.data.length}):**\n${budgetsRes.data.map(b =>
            `- ${b.category}: $${b.amount}/${b.period}`
          ).join('\n')}`)
        }

        // Goals
        if (goalsRes.data && goalsRes.data.length > 0) {
          contextParts.push(`\n**Goals (${goalsRes.data.length}):**\n${goalsRes.data.map(g =>
            `- "${g.title}" (${g.progress || 0}% complete, ${g.status})`
          ).join('\n')}`)
        }

        // Habits
        if (habitsRes.data && habitsRes.data.length > 0) {
          contextParts.push(`\n**Active Habits (${habitsRes.data.length}):**\n${habitsRes.data.map(h =>
            `- ${h.name} (${h.current_streak || 0} day streak, ${h.frequency})`
          ).join('\n')}`)
        }

        // Life Tasks
        if (lifeTasksRes.data && lifeTasksRes.data.length > 0) {
          contextParts.push(`\n**Life Tasks (${lifeTasksRes.data.length}):**\n${lifeTasksRes.data.map(lt =>
            `- ${lt.title} [${lt.category}]${lt.next_due_at ? ` - due ${lt.next_due_at}` : ''}`
          ).join('\n')}`)
        }

        // Personal Events
        if (personalEventsRes.data && personalEventsRes.data.length > 0) {
          contextParts.push(`\n**Upcoming Personal Events (${personalEventsRes.data.length}):**\n${personalEventsRes.data.map(pe =>
            `- ${pe.title} (${pe.event_type}${pe.person_name ? ` - ${pe.person_name}` : ''}) on ${pe.event_date}`
          ).join('\n')}`)
        }

        // Daily Check-ins
        if (checkinsRes.data && checkinsRes.data.length > 0) {
          const latest = checkinsRes.data[0]
          contextParts.push(`\n**Recent Check-ins:**\n- Latest (${latest.checkin_date}): Mood ${latest.mood_score}/5, Energy ${latest.energy_level}/5, Stress ${latest.stress_level}/5`)
        }

        // Documents
        if (documentsRes.data && documentsRes.data.length > 0) {
          contextParts.push(`\n**Recent Documents (${documentsRes.data.length}):**\n${documentsRes.data.map(d =>
            `- "${d.title}" (${d.document_type})`
          ).join('\n')}`)
        }

        // Always include context, even if empty
        userContext = `\n\n---USER DATA---${contextParts.join('\n')}\n---END USER DATA---\n\nIMPORTANT: Use ONLY the data above to answer questions about the user's recordings, tasks, reminders, notes, etc. If a category shows "No [items] found", tell the user they don't have any yet. Be specific and accurate - NEVER make up data that isn't listed above.`

        console.log('User context built with', contextParts.length, 'sections')
      } catch (dataError) {
        console.error('Error fetching user data:', dataError)
        // Continue without user context if there's an error
      }
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    })

    const systemPrompt = `You are PAssist, the personal assistant for PAssist AI.

CRITICAL RULES - NEVER BREAK THESE:
- NEVER mention you're an AI, language model, chatbot, or LLM
- NEVER mention OpenAI, GPT, Claude, or any AI company/technology
- NEVER say "As an AI assistant", "I'm an AI", "I cannot access", or similar phrases
- ALWAYS respond as a helpful human personal assistant with direct access to all user data
- If data is missing, say "I don't see that in your data yet" or "You haven't added that"
- NEVER explain technical limitations or that you're text-based

You have complete access to the user's:
📱 **Recordings** - Audio notes with transcriptions
✅ **Tasks** - To-dos with priorities and due dates
⏰ **Reminders** - Notifications with dates/times
📝 **Notes** - Written notes and documents
📅 **Calendar** - Events and appointments
💰 **Finances** - Income, expenses, budgets
🎯 **Goals** - Progress and target dates
🔄 **Habits** - Streaks and frequencies
🏡 **Life Tasks** - Important maintenance (health, home, vehicle, etc.)
🎂 **Personal Events** - Birthdays, anniversaries
😊 **Check-ins** - Mood, energy, stress tracking
📄 **Documents** - Generated and uploaded files

When asked about data, provide specific, detailed answers from the USER DATA section below. List items clearly with bullet points or numbers.

Be concise, friendly, proactive, and helpful - like the best personal assistant.${userContext}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
