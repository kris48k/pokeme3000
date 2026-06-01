# PokeMe3000 — Project Context

## What this is

A PWA habit reminder that fires random notifications throughout the day. Users add items they want to be reminded about ("pokes"); the app schedules random alarms across a configurable daily window. Tone is casual and robot-themed.

## Stack

- React 19 + TypeScript + Vite
- `vite-plugin-pwa` with `injectManifest` strategy — custom `src/sw.ts`
- `workbox-precaching` for SW precache
- No backend — everything in the browser

## Key files

| File | Purpose |
|---|---|
| `src/types.ts` | All shared interfaces and union types |
| `src/storage.ts` | localStorage helpers |
| `src/scheduler.ts` | Schedule building, alarm checking, index shifting |
| `src/notifications.ts` | SW-first notifications with `new Notification()` fallback |
| `src/sw.ts` | Custom SW: `skipWaiting`, `clients.claim`, `notificationclick` |
| `src/utils.ts` | `HABIT_SUGGESTIONS`, `formatTime`, `alarmStatus` |
| `src/App.tsx` | All state and event handlers |
| `src/components/` | Header, ActiveAlarm, TabNav, ItemsPanel, SchedulePanel, SettingsModal, ItemCard |

## localStorage keys

| Key | Type |
|---|---|
| `ra_items` | `string[]` |
| `ra_settings` | `Settings` |
| `ra_schedule` | `{ date, alarms, itemCount }` |
| `ra_tab` | `'items' \| 'schedule'` |
| `ra_theme` | `'dark' \| 'light'` |

## Core types

```typescript
interface Alarm {
  minuteOfDay: number       // minutes since midnight
  itemIndex: number         // index into items[]
  fired: boolean
  result?: 'done' | 'dismissed'
}

type Tab = 'items' | 'schedule'  // no settings tab — it's a modal
type Theme = 'dark' | 'light'
```

## Architecture decisions

**Schedule uses array indices, not IDs.** Alarms reference items by index. When adding/removing items, use `addItemToSchedule` / `removeItemFromSchedule` in `scheduler.ts` to shift indices in-place — never do a full rebuild when items change.

**Reschedule keeps fired alarms.** `handleRebuildSchedule` preserves `fired: true` alarms and only generates new slots after the current time via `buildScheduleAfterNow`. Don't wipe the whole schedule.

**No settings tab.** `Tab = 'items' | 'schedule'` only. Settings live in a modal opened via ⚙️ in the header.

**Reschedule button is in the header** (top right), not in SchedulePanel.

**Alarm statuses are exactly 3:** `scheduled`, `done`, `dismissed`. The `alarmStatus()` helper in `utils.ts` is the single source of truth — used in both `ItemCard` and `SchedulePanel`.

**New items prepend at index 0** and get one random alarm between now and `windowEnd` via `randomTimeAfterNow`. If now is past the window, no alarm is added for today.

**Items display sorted by next scheduled time** — visual only, original indices are always used for schedule operations.

**SW: injectManifest strategy.** `devOptions: { enabled: true, type: 'module' }` enables SW in Vite dev. `skipWaiting` + `clients.claim` gives immediate control on first load.

**Notifications: SW-first.** `fireNotification` checks `navigator.serviceWorker.controller` — if set, uses `registration.showNotification()`; otherwise falls back to `new Notification()`.

## UI style

- **No row borders** — `.item-row`, `.schedule-row`, `.setting-row` use background color only
- Dark theme default, warm yellowish tones (bg `#1f1e30`, text `#e8e2d0`)
- Light theme warm parchment tones (bg `#fdf8ed`)
- Muted color for secondary buttons (Reschedule, etc.)
- Modals dismiss on backdrop click or ✕
