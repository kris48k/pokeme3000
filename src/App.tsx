import { useState, useEffect, useRef, useCallback } from 'react'
import { loadItems, saveItems, loadSettings, saveSettings, loadTab, saveTab, loadTheme, saveTheme } from './storage'
import { getOrBuildSchedule, updateSchedule, getDueAlarm, currentMinuteOfDay, addItemToSchedule, removeItemFromSchedule, randomTimeAfterNow, buildScheduleAfterNow } from './scheduler'
import { requestPermission, fireNotification, currentPermission } from './notifications'
import Header from './components/Header'
import ActiveAlarm from './components/ActiveAlarm'
import TabNav from './components/TabNav'
import ItemsPanel from './components/ItemsPanel'
import SchedulePanel from './components/SchedulePanel'
import SettingsModal from './components/SettingsModal'
import type { Alarm, ActiveAlarmState, EditingSettings, PermStatus, Settings, Tab, Theme } from './types'
import './App.css'

const IS_PROD = import.meta.env.PROD
const IS_PROD_V2 = import.meta.env.VITE_TEST

console.log("kris:is_prod", IS_PROD, IS_PROD_V2);
const POLL_INTERVAL = 30_000

export default function App() {
  const [items, setItems] = useState<string[]>(loadItems)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [schedule, setSchedule] = useState<Alarm[]>([])
  const [permStatus, setPermStatus] = useState<PermStatus>(() => currentPermission() ?? 'default')
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmState | null>(null)
  const [newItem, setNewItem] = useState('')
  const [tab, setTab] = useState<Tab>(loadTab)
  const [theme, setTheme] = useState<Theme>(() => {
    const t = loadTheme()
    document.documentElement.dataset.theme = t
    return t
  })
  const [editingSettings, setEditingSettings] = useState<EditingSettings>(() => {
    const s = loadSettings()
    return { ...s, alarmsPerDay: String(s.alarmsPerDay) }
  })
  const [showSettings, setShowSettings] = useState(false)
  const [newlyAddedItem, setNewlyAddedItem] = useState<string | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items
  const mountedRef = useRef(false)

  const refreshSchedule = useCallback((currentItems: string[], currentSettings: Settings) => {
    const alarms = getOrBuildSchedule(currentSettings, currentItems.length)
    setSchedule(alarms)
    return alarms
  }, [])

  useEffect(() => {
    const alarms = refreshSchedule(items, settings)

    function checkAlarms(currentAlarms: Alarm[]): Alarm[] {
      const due = getDueAlarm(currentAlarms)
      if (!due) return currentAlarms
      const item = itemsRef.current[due.itemIndex] ?? itemsRef.current[0]
      if (item) {
        setActiveAlarm({ item, index: due.itemIndex })
        fireNotification(item)
      }
      const updated = currentAlarms.map((a) =>
        a === due ? { ...a, fired: true } : a
      )
      updateSchedule(updated, itemsRef.current.length)
      setSchedule(updated)
      return updated
    }

    if (!mountedRef.current) {
      mountedRef.current = true
      checkAlarms(alarms)
    }

    const id = setInterval(() => {
      setSchedule((prev) => checkAlarms(prev))
    }, POLL_INTERVAL)

    return () => clearInterval(id)
  }, [items, settings, refreshSchedule])

  function handleAddItem(e: { preventDefault(): void }) {
    e.preventDefault()
    const text = newItem.trim()
    if (!text) return
    const updated = [text, ...items]
    setItems(updated)
    saveItems(updated)
    setNewItem('')
    setNewlyAddedItem(text)
    const shifted = addItemToSchedule(schedule, 0, updated.length)
    const newMinute = randomTimeAfterNow(settings)
    const withNew = newMinute !== null
      ? [...shifted, { minuteOfDay: newMinute, itemIndex: 0, fired: false }].sort((a, b) => a.minuteOfDay - b.minuteOfDay)
      : shifted
    updateSchedule(withNew, updated.length)
    setSchedule(withNew)
  }

  function handleRemoveItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
    saveItems(updated)
    setSchedule(removeItemFromSchedule(schedule, index, updated.length))
  }

  function handleAddSuggestion(habit: string) {
    const updated = [habit, ...items]
    setItems(updated)
    saveItems(updated)
    setNewlyAddedItem(habit)
    const shifted = addItemToSchedule(schedule, 0, updated.length)
    const newMinute = randomTimeAfterNow(settings)
    const withNew = newMinute !== null
      ? [...shifted, { minuteOfDay: newMinute, itemIndex: 0, fired: false }].sort((a, b) => a.minuteOfDay - b.minuteOfDay)
      : shifted
    updateSchedule(withNew, updated.length)
    setSchedule(withNew)
  }

  function handleSaveSettings() {
    const s: Settings = {
      windowStart: editingSettings.windowStart,
      windowEnd: editingSettings.windowEnd,
      alarmsPerDay: Math.max(1, Math.min(24, Number(editingSettings.alarmsPerDay))),
    }
    setSettings(s)
    saveSettings(s)
  }

  function handleSnooze() {
    if (!activeAlarm) return
    const snoozeMinute = currentMinuteOfDay() + 30
    const snoozeEntry: Alarm = { minuteOfDay: snoozeMinute, itemIndex: activeAlarm.index, fired: false }
    const updated = [...schedule, snoozeEntry].sort((a, b) => a.minuteOfDay - b.minuteOfDay)
    updateSchedule(updated, items.length)
    setSchedule(updated)
    setActiveAlarm(null)
  }

  async function handleRequestPermission() {
    const result = await requestPermission()
    setPermStatus(result)
  }

  function handleRemovePoke(itemIndex: number, minute: number) {
    const updated = schedule.filter((a) => !(a.itemIndex === itemIndex && a.minuteOfDay === minute && !a.fired))
    updateSchedule(updated, items.length)
    setSchedule(updated)
  }

  function handleAddPoke(itemIndex: number) {
    const minute = randomTimeAfterNow(settings)
    if (minute === null) return
    const updated = [...schedule, { minuteOfDay: minute, itemIndex, fired: false }]
      .sort((a, b) => a.minuteOfDay - b.minuteOfDay)
    updateSchedule(updated, items.length)
    setSchedule(updated)
  }

  function handleRebuildSchedule() {
    const fired = schedule.filter((a) => a.fired)
    const fresh = buildScheduleAfterNow(settings, items.length)
    const combined = [...fired, ...fresh].sort((a, b) => a.minuteOfDay - b.minuteOfDay)
    updateSchedule(combined, items.length)
    setSchedule(combined)
  }

  function handleReschedule(itemIndex: number, changes: Array<{ oldMinute: number; newMinute: number }>) {
    let updated = [...schedule]
    for (const { oldMinute, newMinute } of changes) {
      const idx = updated.findIndex((a) => a.itemIndex === itemIndex && a.minuteOfDay === oldMinute && !a.fired)
      if (idx >= 0) {
        updated = updated.map((a, i) => i === idx ? { ...a, minuteOfDay: newMinute } : a)
      } else {
        updated = [...updated, { minuteOfDay: newMinute, itemIndex, fired: false }]
      }
    }
    const sorted = updated.sort((a, b) => a.minuteOfDay - b.minuteOfDay)
    updateSchedule(sorted, items.length)
    setSchedule(sorted)
  }

  function handleSettingChange(key: keyof Settings, value: string) {
    setEditingSettings((s) => ({ ...s, [key]: value }))
  }

  function handleToggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setTheme(next)
    saveTheme(next)
  }

  return (
    <div className="app">
      <Header permStatus={permStatus} onRequestPermission={handleRequestPermission} onReschedule={handleRebuildSchedule} onOpenSettings={() => setShowSettings(true)} />
      <ActiveAlarm
        alarm={activeAlarm}
        onDone={() => {
          if (activeAlarm) {
            const updated = schedule.map((a) =>
              a.itemIndex === activeAlarm.index && a.fired && !a.result
                ? { ...a, result: 'done' as const }
                : a
            )
            updateSchedule(updated, items.length)
            setSchedule(updated)
          }
          setActiveAlarm(null)
        }}
        onDismiss={() => {
          if (activeAlarm) {
            const updated = schedule.map((a) =>
              a.itemIndex === activeAlarm.index && a.fired && !a.result
                ? { ...a, result: 'dismissed' as const }
                : a
            )
            updateSchedule(updated, items.length)
            setSchedule(updated)
          }
          setActiveAlarm(null)
        }}
        onSnooze={handleSnooze}
      />
      <TabNav
        tab={tab}
        onTabChange={(t) => { setTab(t); saveTab(t) }}
        scheduleDone={schedule.filter((a) => a.fired).length}
        scheduleTotal={schedule.length}
      />
      <main className="main">
        {tab === 'items' && (
          <ItemsPanel
            items={items}
            schedule={schedule}
            newItem={newItem}
            onNewItemChange={setNewItem}
            onAddItem={handleAddItem}
            onAddSuggestion={handleAddSuggestion}
            onRemoveItem={handleRemoveItem}
            onReschedule={handleReschedule}
            onAddPoke={handleAddPoke}
            onRemovePoke={handleRemovePoke}
            newlyAddedItem={newlyAddedItem}
            onClearNewItem={() => setNewlyAddedItem(null)}
          />
        )}
        {tab === 'schedule' && (
          <SchedulePanel
            schedule={schedule}
            items={items}
          />
        )}
      </main>
      {showSettings && (
        <SettingsModal
          editingSettings={editingSettings}
          theme={theme}
          onSettingChange={handleSettingChange}
          onSave={handleSaveSettings}
          onToggleTheme={handleToggleTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
