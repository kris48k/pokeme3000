// Custom alarm service worker logic
// This runs alongside the Workbox-generated SW via importScripts or inline

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_ALARMS') {
    const { alarms } = event.data
    // Store alarms so we can check them on periodic sync / fetch events
    self.alarmList = alarms
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/')
    })
  )
})
