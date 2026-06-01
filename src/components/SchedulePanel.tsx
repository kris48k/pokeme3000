import type { Alarm } from '../types'
import { formatTime, alarmStatus } from '../utils'

interface Props {
  schedule: Alarm[]
  items: string[]
}

export default function SchedulePanel({ schedule, items }: Props) {
  return (
    <section className="panel">
      <p className="schedule-info">
        {schedule.filter((a) => !a.fired).length} alarms remaining today
      </p>

      {schedule.length === 0 ? (
        <p className="empty">Add items to generate a schedule.</p>
      ) : (
        <ul className="schedule-list">
          {schedule.map((alarm, i) => {
            const status = alarmStatus(alarm)
            return (
              <li key={i} className={`schedule-row ${alarm.fired ? 'fired' : ''}`}>
                <span className="alarm-time">{formatTime(alarm.minuteOfDay)}</span>
                <span className="alarm-item-name">{items[alarm.itemIndex] ?? '—'}</span>
                <span className={`status-badge status-badge--${status}`}>{status}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
