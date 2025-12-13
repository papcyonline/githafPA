/**
 * Push Notifications Service
 * Handles browser notifications for reminders, tasks, and events
 */

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: Record<string, unknown>
  requireInteraction?: boolean
}

export type NotificationPermission = 'granted' | 'denied' | 'default'

class NotificationsService {
  private swRegistration: ServiceWorkerRegistration | null = null

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied'
    return Notification.permission as NotificationPermission
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission as NotificationPermission
  }

  /**
   * Register service worker for notifications
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      this.swRegistration = registration
      console.log('Service worker registered for notifications')
      return registration
    } catch (error) {
      console.error('Service worker registration failed:', error)
      return null
    }
  }

  /**
   * Show a notification
   */
  async showNotification(payload: NotificationPayload): Promise<boolean> {
    if (this.getPermission() !== 'granted') {
      console.warn('Notification permission not granted')
      return false
    }

    try {
      // Use service worker if available for better reliability
      if (this.swRegistration) {
        await this.swRegistration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/logo.png',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: payload.requireInteraction || false,
        })
      } else {
        // Fallback to direct Notification API
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/logo.png',
          tag: payload.tag,
        })
      }
      return true
    } catch (error) {
      console.error('Failed to show notification:', error)
      return false
    }
  }

  /**
   * Schedule a notification for a specific time
   */
  scheduleNotification(payload: NotificationPayload, scheduledTime: Date): NodeJS.Timeout | null {
    const now = new Date()
    const delay = scheduledTime.getTime() - now.getTime()

    if (delay <= 0) {
      console.warn('Cannot schedule notification in the past')
      return null
    }

    return setTimeout(() => {
      this.showNotification(payload)
    }, delay)
  }

  /**
   * Schedule reminder notifications
   */
  async scheduleReminderNotifications(reminders: Array<{
    id: string
    title: string
    description?: string
    reminder_date: string
    reminder_time: string
  }>): Promise<void> {
    const now = new Date()

    for (const reminder of reminders) {
      const reminderDateTime = new Date(`${reminder.reminder_date}T${reminder.reminder_time}`)

      // Only schedule future reminders
      if (reminderDateTime > now) {
        this.scheduleNotification(
          {
            title: 'Reminder',
            body: reminder.title,
            tag: `reminder-${reminder.id}`,
            data: { type: 'reminder', id: reminder.id },
            requireInteraction: true,
          },
          reminderDateTime
        )
      }
    }
  }

  /**
   * Show immediate notification for overdue tasks
   */
  async notifyOverdueTasks(count: number): Promise<void> {
    if (count > 0) {
      await this.showNotification({
        title: 'Overdue Tasks',
        body: `You have ${count} overdue task${count > 1 ? 's' : ''} that need attention`,
        tag: 'overdue-tasks',
        data: { type: 'overdue', count },
      })
    }
  }

  /**
   * Show notification for upcoming event
   */
  async notifyUpcomingEvent(event: {
    id: string
    title: string
    start_time: string
  }, minutesBefore: number = 15): Promise<void> {
    await this.showNotification({
      title: `Upcoming: ${event.title}`,
      body: `Starting in ${minutesBefore} minutes`,
      tag: `event-${event.id}`,
      data: { type: 'event', id: event.id },
    })
  }

  /**
   * Daily briefing notification
   */
  async showDailyBriefing(stats: {
    tasks: number
    reminders: number
    events: number
    overdue: number
  }): Promise<void> {
    const parts: string[] = []

    if (stats.overdue > 0) {
      parts.push(`${stats.overdue} overdue`)
    }
    if (stats.tasks > 0) {
      parts.push(`${stats.tasks} task${stats.tasks > 1 ? 's' : ''}`)
    }
    if (stats.reminders > 0) {
      parts.push(`${stats.reminders} reminder${stats.reminders > 1 ? 's' : ''}`)
    }
    if (stats.events > 0) {
      parts.push(`${stats.events} event${stats.events > 1 ? 's' : ''}`)
    }

    const body = parts.length > 0
      ? `Today: ${parts.join(', ')}`
      : 'Your schedule is clear today!'

    await this.showNotification({
      title: 'Good Morning!',
      body,
      tag: 'daily-briefing',
      data: { type: 'briefing' },
    })
  }
}

export const notificationsService = new NotificationsService()
