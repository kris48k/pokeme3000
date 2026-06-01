import type { ActiveAlarmState } from '../types'

interface Props {
  alarm: ActiveAlarmState | null
  onDone: () => void
  onDismiss: () => void
  onSnooze: () => void
}

export default function ActiveAlarm({ alarm, onDone, onDismiss, onSnooze }: Props) {
  if (!alarm) return null

  return (
    <div className="active-alarm">
      <div className="alarm-content">
        <div className="alarm-icon">🤖</div>
        <div className="alarm-label">Poke!</div>
        <div className="alarm-item">{alarm.item}</div>
        <div className="alarm-actions">
          <button className="alarm-done-btn" onClick={onDone}>Done ✓</button>
          <button className="alarm-dismiss-btn" onClick={onDismiss}>Dismiss</button>
          <button className="snooze-btn" onClick={onSnooze}>Remind in 30 min</button>
        </div>
      </div>
    </div>
  )
}
