import { supabase } from './supabase'

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  progress: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  category: string | null
  color: string
  created_at: string
  updated_at: string
  milestones?: GoalMilestone[]
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  target_date: string | null
  completed: boolean
  completed_at: string | null
  order_index: number
  created_at: string
}

export interface CreateGoalInput {
  title: string
  description?: string
  target_date?: string
  category?: string
  color?: string
}

export interface UpdateGoalInput {
  title?: string
  description?: string
  target_date?: string
  progress?: number
  status?: 'active' | 'completed' | 'paused' | 'cancelled'
  category?: string
  color?: string
}

export interface CreateMilestoneInput {
  goal_id: string
  title: string
  target_date?: string
  order_index?: number
}

export const goalsService = {
  async getGoals(status?: string): Promise<Goal[]> {
    let query = supabase
      .from('goals')
      .select('*, milestones:goal_milestones(*)')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getActiveGoals(): Promise<Goal[]> {
    return this.getGoals('active')
  },

  async getGoalById(id: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select('*, milestones:goal_milestones(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async createGoal(input: CreateGoalInput): Promise<Goal> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        target_date: input.target_date || null,
        category: input.category || null,
        color: input.color || '#10B981',
        progress: 0,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
    const updateData: Record<string, unknown> = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.target_date !== undefined) updateData.target_date = input.target_date
    if (input.progress !== undefined) updateData.progress = input.progress
    if (input.status !== undefined) updateData.status = input.status
    if (input.category !== undefined) updateData.category = input.category
    if (input.color !== undefined) updateData.color = input.color

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProgress(id: string, progress: number): Promise<Goal> {
    const status = progress >= 100 ? 'completed' : 'active'
    return this.updateGoal(id, { progress: Math.min(100, Math.max(0, progress)), status })
  },

  async completeGoal(id: string): Promise<Goal> {
    return this.updateGoal(id, { progress: 100, status: 'completed' })
  },

  async pauseGoal(id: string): Promise<Goal> {
    return this.updateGoal(id, { status: 'paused' })
  },

  async resumeGoal(id: string): Promise<Goal> {
    return this.updateGoal(id, { status: 'active' })
  },

  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Milestone methods
  async getMilestones(goalId: string): Promise<GoalMilestone[]> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createMilestone(input: CreateMilestoneInput): Promise<GoalMilestone> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .insert({
        goal_id: input.goal_id,
        title: input.title,
        target_date: input.target_date || null,
        order_index: input.order_index || 0,
        completed: false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async toggleMilestone(id: string): Promise<GoalMilestone> {
    // First get current state
    const { data: current, error: fetchError } = await supabase
      .from('goal_milestones')
      .select('completed')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newCompleted = !current.completed
    const { data, error } = await supabase
      .from('goal_milestones')
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteMilestone(id: string): Promise<void> {
    const { error } = await supabase
      .from('goal_milestones')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Helper to calculate progress based on milestones
  async recalculateProgress(goalId: string): Promise<Goal> {
    const milestones = await this.getMilestones(goalId)
    if (milestones.length === 0) return this.getGoalById(goalId) as Promise<Goal>

    const completedCount = milestones.filter(m => m.completed).length
    const progress = Math.round((completedCount / milestones.length) * 100)

    return this.updateProgress(goalId, progress)
  },

  async getGoalStats(): Promise<{
    total: number
    active: number
    completed: number
    averageProgress: number
  }> {
    const goals = await this.getGoals()
    const active = goals.filter(g => g.status === 'active')
    const completed = goals.filter(g => g.status === 'completed')
    const avgProgress = active.length > 0
      ? Math.round(active.reduce((sum, g) => sum + g.progress, 0) / active.length)
      : 0

    return {
      total: goals.length,
      active: active.length,
      completed: completed.length,
      averageProgress: avgProgress,
    }
  },
}
