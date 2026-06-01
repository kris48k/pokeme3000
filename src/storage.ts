import type { Settings, StoredSchedule, Tab, Theme } from './types'

const KEYS = {
  ITEMS: 'ra_items',
  SETTINGS: 'ra_settings',
  SCHEDULE: 'ra_schedule',
  TAB: 'ra_tab',
  THEME: 'ra_theme',
} as const

export const defaultSettings: Settings = {
  windowStart: '08:00',
  windowEnd: '22:00',
  alarmsPerDay: 20,
}

export function loadItems(): string[] {
  try {
    return (JSON.parse(localStorage.getItem(KEYS.ITEMS) ?? 'null') as string[]) ?? []
  } catch {
    return []
  }
}

export function saveItems(items: string[]): void {
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(items))
}

export function loadSettings(): Settings {
  try {
    return { ...defaultSettings, ...(JSON.parse(localStorage.getItem(KEYS.SETTINGS) ?? 'null') as Partial<Settings>) }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

export function loadSchedule(): StoredSchedule | null {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SCHEDULE) ?? 'null') as StoredSchedule | null
  } catch {
    return null
  }
}

export function saveSchedule(schedule: StoredSchedule | null): void {
  localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule))
}

const VALID_TABS: Tab[] = ['items', 'schedule']

export function loadTab(): Tab {
  const stored = localStorage.getItem(KEYS.TAB) as Tab | null
  return stored && VALID_TABS.includes(stored) ? stored : 'items'
}

export function saveTab(tab: Tab): void {
  localStorage.setItem(KEYS.TAB, tab)
}

export function loadTheme(): Theme {
  const stored = localStorage.getItem(KEYS.THEME)
  return stored === 'light' ? 'light' : 'dark'
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEYS.THEME, theme)
}
