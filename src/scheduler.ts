import { loadSchedule, saveSchedule } from './storage'
import type { Settings, Alarm } from './types'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function buildSchedule(settings: Settings, itemCount: number): Alarm[] {
  if (itemCount === 0) return []
  const startMin = parseTime(settings.windowStart)
  const endMin = parseTime(settings.windowEnd)
  const count = settings.alarmsPerDay
  const span = endMin - startMin
  if (span <= 0) return []

  // Divide window into equal slots and pick a random time in each slot
  const slotSize = Math.floor(span / count)
  const times: number[] = []
  for (let i = 0; i < count; i++) {
    const slotStart = startMin + i * slotSize
    const slotEnd = slotStart + slotSize
    times.push(randomBetween(slotStart, slotEnd - 1))
  }
  times.sort((a, b) => a - b)

  return times.map((t, idx) => ({
    minuteOfDay: t,
    itemIndex: idx % itemCount,
    fired: false,
  }))
}

export function getOrBuildSchedule(settings: Settings, itemCount: number): Alarm[] {
  const existing = loadSchedule()
  const today = todayKey()
  // Rebuild only if: no schedule or wrong date (itemCount change is handled in-place)
  if (
    existing &&
    existing.date === today &&
    existing.alarms &&
    existing.alarms.length > 0 &&
    existing.itemCount === itemCount
  ) {
    return existing.alarms
  }
  const alarms = buildSchedule(settings, itemCount)
  saveSchedule({ date: today, alarms, itemCount })
  return alarms
}

export function buildScheduleAfterNow(settings: Settings, itemCount: number): Alarm[] {
  if (itemCount === 0) return []
  const now = currentMinuteOfDay()
  const startMin = now + 1
  const endMin = parseTime(settings.windowEnd)
  const span = endMin - startMin
  if (span <= 0) return []

  const count = settings.alarmsPerDay
  const slotSize = Math.max(1, Math.floor(span / count))
  const times: number[] = []
  for (let i = 0; i < count; i++) {
    const slotStart = startMin + i * slotSize
    if (slotStart >= endMin) break
    times.push(randomBetween(slotStart, Math.min(slotStart + slotSize, endMin) - 1))
  }
  times.sort((a, b) => a - b)

  return times.map((t, idx) => ({
    minuteOfDay: t,
    itemIndex: idx % itemCount,
    fired: false,
  }))
}

export function randomTimeAfterNow(settings: Settings): number | null {
  const now = currentMinuteOfDay()
  const endMin = parseTime(settings.windowEnd)
  if (now >= endMin - 1) return null
  return randomBetween(now + 1, endMin - 1)
}

export function addItemToSchedule(alarms: Alarm[], insertIndex: number, newItemCount: number): Alarm[] {
  const updated = alarms.map((a) =>
    a.itemIndex >= insertIndex ? { ...a, itemIndex: a.itemIndex + 1 } : a
  )
  saveSchedule({ date: todayKey(), alarms: updated, itemCount: newItemCount })
  return updated
}

export function removeItemFromSchedule(alarms: Alarm[], removedIndex: number, newItemCount: number): Alarm[] {
  const updated = alarms
    .filter((a) => a.itemIndex !== removedIndex)
    .map((a) => a.itemIndex > removedIndex ? { ...a, itemIndex: a.itemIndex - 1 } : a)
  saveSchedule({ date: todayKey(), alarms: updated, itemCount: newItemCount })
  return updated
}

export function updateSchedule(alarms: Alarm[], itemCount: number): void {
  const today = todayKey()
  saveSchedule({ date: today, alarms, itemCount })
}

export function currentMinuteOfDay(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function getDueAlarm(alarms: Alarm[]): Alarm | null {
  const now = currentMinuteOfDay()
  return alarms.find((a) => !a.fired && a.minuteOfDay <= now) ?? null
}
