/**
 * Service Worker for Push Notifications
 * PAssist AI - Personal Assistant
 */

const CACHE_NAME = 'passist-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service worker installed')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service worker activated')
  event.waitUntil(clients.claim())
})

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body || '',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    tag: data.tag || 'default',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'PAssist AI', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  let url = '/'

  // Navigate based on notification type
  switch (data.type) {
    case 'reminder':
      url = '/reminders'
      break
    case 'task':
    case 'overdue':
      url = '/dashboard'
      break
    case 'event':
      url = '/calendar'
      break
    case 'briefing':
      url = '/dashboard'
      break
    default:
      url = '/dashboard'
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks())
  }
})

async function syncTasks() {
  // Placeholder for background sync functionality
  console.log('Syncing tasks in background...')
}
