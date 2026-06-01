import type { PermStatus } from '../types'

interface Props {
  permStatus: PermStatus
  onRequestPermission: () => void
  onReschedule: () => void
  onOpenSettings: () => void
}

export default function Header({ permStatus, onRequestPermission, onReschedule, onOpenSettings }: Props) {
  return (
    <header className="header">
      <h1>🤖 PokeMe3000</h1>
      <div className="header-actions">
        {permStatus !== 'granted' && (
          <button className="perm-btn" onClick={onRequestPermission}>
            {permStatus === 'denied' ? '🔕 Notifications blocked' : '🔔 Enable notifications'}
          </button>
        )}
        <button className="settings-btn" onClick={onReschedule} title="Reschedule">Reschedule ⏰</button>
        <button className="settings-btn" onClick={onOpenSettings} title="Settings">⚙️</button>
      </div>
    </header>
  )
}
