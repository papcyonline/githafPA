import { supabase } from './supabase'

export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'team'
  name?: string
  team_id?: string
  created_by?: string
  created_at: string
  updated_at: string
  participants?: ConversationParticipant[]
  last_message?: Message
  unread_count?: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    created_at: string
  }
  joined_at: string
  last_read_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    created_at: string
  }
  content: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

class ChatService {
  async getUserConversations(): Promise<Conversation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          last_read_at,
          is_hidden,
          conversations (
            id,
            type,
            name,
            team_id,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_hidden', false)
        .order('last_read_at', { ascending: false })

      if (participantsError) throw participantsError
      if (!participants) return []

      const conversations: Conversation[] = []

      for (const participant of participants) {
        const conv = (participant as any).conversations
        if (!conv) continue

        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_deleted', false)
          .gt('created_at', participant.last_read_at || '1970-01-01')
          .neq('sender_id', user.id)

        const { data: convParticipants } = await supabase
          .from('conversation_participants')
          .select('id, conversation_id, user_id, joined_at, last_read_at')
          .eq('conversation_id', conv.id)

        let participantProfiles: any[] = []
        if (convParticipants && convParticipants.length > 0) {
          const participantIds = convParticipants.map(p => p.user_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url, created_at')
            .in('id', participantIds)

          participantProfiles = profiles || []
        }

        const profileMap = new Map(participantProfiles.map(p => [p.id, p]))

        conversations.push({
          ...conv,
          last_message: lastMessage || undefined,
          unread_count: unreadCount || 0,
          participants: convParticipants?.map((p: any) => ({
            id: p.id,
            conversation_id: p.conversation_id,
            user_id: p.user_id,
            joined_at: p.joined_at,
            last_read_at: p.last_read_at,
            user: profileMap.get(p.user_id) || undefined,
          })) || [],
        })
      }

      return conversations
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      if (!messages || messages.length === 0) return []

      const senderIds = [...new Set(messages.map(m => m.sender_id))]

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at')
        .in('id', senderIds)

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      return messages.map(m => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at,
        updated_at: m.updated_at,
        is_deleted: m.is_deleted,
        sender: profileMap.get(m.sender_id) || undefined,
      })).reverse()
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select()
        .single()

      if (error) throw error
      return message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  }
}

export default new ChatService()
