import type { PermStatus } from './types'

export async function requestPermission(): Promise<PermStatus> {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export async function currentPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function fireNotification(item: string): Promise<void> {
  if (!("Notification" in window)) {
    // Check if the browser supports notifications
    console.log("This browser does not support desktop notification");
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      try {
        const reg = await navigator.serviceWorker.ready
        await reg.showNotification("PokeMe3000FromSW", {
          body: item,
          tag: "poke-me-3000",
      })

        return
      } catch {
        // fall through to basic notification
      }

      return
    }
  }

  let permissions = ""
  if (Notification.permission !== "denied") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    permissions = await Notification.requestPermission()
  } else {
    permissions = Notification.permission;
  }

  if (permissions !== "granted") {
    console.log("Permissions are not granted: ", permissions)
    // return
  }

  const n = new Notification('PokeMe3000', {
    body: item,
    requireInteraction: true,
    tag: "PokeMe3000",

  });
  n.onclick = () => { window.focus(); n.close() }

}
