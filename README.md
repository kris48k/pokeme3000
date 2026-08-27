# PokeMe3000 🤖

A PWA habit reminder that pokes you at random times throughout the day. Add the things you want to be reminded about, and the app schedules random alarms across a configurable daily window — so reminders don't turn into a routine you learn to ignore.

## How it works

- Add "pokes" — short habit reminders (drink water, stretch, check posture, whatever).
- The app builds a schedule of random alarm times spread across your configured daily window.
- When an alarm fires, you get a notification and can mark it done or dismiss it.
- Reschedule at any time — already-fired alarms are kept, only future slots get regenerated.

No backend, no accounts — everything lives in the browser via `localStorage`.

## Tech stack

- [React 19](https://react.dev/) + TypeScript + [Vite](https://vitejs.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) with the `injectManifest` strategy and a custom service worker (`src/sw.ts`)
- [workbox-precaching](https://developer.chrome.com/docs/workbox/) for service worker precaching
- Notifications via the Service Worker API, with a `new Notification()` fallback

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # lint the codebase
```

## Project structure

| File | Purpose |
|---|---|
| `src/types.ts` | Shared interfaces and union types |
| `src/storage.ts` | `localStorage` helpers |
| `src/scheduler.ts` | Schedule building, alarm checking, index shifting |
| `src/notifications.ts` | SW-first notifications with fallback |
| `src/sw.ts` | Custom service worker |
| `src/utils.ts` | Habit suggestions, time formatting, alarm status |
| `src/App.tsx` | App state and event handlers |
| `src/components/` | UI components (header, alarm view, items panel, schedule panel, settings modal) |
