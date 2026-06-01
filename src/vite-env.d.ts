/// <reference types="vite/client" />

// renotify is part of the Notifications API spec but not yet in TypeScript's DOM lib
interface NotificationOptions {
  renotify?: boolean
}
