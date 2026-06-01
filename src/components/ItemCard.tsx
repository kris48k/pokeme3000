import { useState, useEffect } from 'react'
import type { Alarm } from '../types'
import { formatTime, alarmStatus } from '../utils'

interface Props {
  item: string
  alarms: Alarm[]
  onReschedule: (changes: Array<{ oldMinute: number; newMinute: number }>) => void
  onAddPoke: () => void
  onRemovePoke: (minute: number) => void
  onClose: () => void
}

function minuteToTime(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

function timeToMinute(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export default function ItemCard({ item, alarms, onReschedule, onAddPoke, onRemovePoke, onClose }: Props) {
  const [editedTimes, setEditedTimes] = useState<Map<number, string>>(
    () => new Map(alarms.map((a) => [a.minuteOfDay, minuteToTime(a.minuteOfDay)]))
  )

  // Sync new alarms added while the card is open (e.g. via Add a poke)
  useEffect(() => {
    setEditedTimes((prev) => {
      const next = new Map(prev)
      for (const a of alarms) {
        if (!next.has(a.minuteOfDay)) {
          next.set(a.minuteOfDay, minuteToTime(a.minuteOfDay))
        }
      }
      return next
    })
  }, [alarms])

  function handleTimeChange(minute: number, value: string) {
    setEditedTimes((prev) => new Map(prev).set(minute, value))
  }

  function handleSave() {
    const changes = alarms
      .filter((a) => !a.fired)
      .map((a) => ({
        oldMinute: a.minuteOfDay,
        newMinute: timeToMinute(editedTimes.get(a.minuteOfDay) ?? minuteToTime(a.minuteOfDay)),
      }))
      .filter(({ oldMinute, newMinute }) => oldMinute !== newMinute)
    if (changes.length > 0) onReschedule(changes)
    onClose()
  }

  return (
    <div className="item-card-overlay" onClick={onClose}>
      <div className="item-card" onClick={(e) => e.stopPropagation()}>
        <div className="item-card-name">{item}</div>

        {alarms.length > 0 && (
          <ul className="item-card-schedule">
            {alarms.map((a) => {
              const status = alarmStatus(a)
              const timeValue = editedTimes.get(a.minuteOfDay) ?? minuteToTime(a.minuteOfDay)
              return (
                <li key={a.minuteOfDay} className={`item-card-slot ${a.fired ? 'item-card-slot--fired' : ''}`}>
                  {status === 'scheduled' ? (
                    <input
                      type="time"
                      className="item-card-time item-card-time--inline"
                      value={timeValue}
                      onChange={(e) => handleTimeChange(a.minuteOfDay, e.target.value)}
                    />
                  ) : (
                    <span>{formatTime(a.minuteOfDay)}</span>
                  )}
                  <span className={`item-card-badge item-card-badge--${status}`}>{status}</span>
                  {status === 'scheduled' && (
                    <button className="item-card-remove-poke" onClick={() => onRemovePoke(a.minuteOfDay)}>✕</button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <button className="item-card-add-poke" onClick={onAddPoke}>+ Add a poke</button>

        <div className="item-card-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
