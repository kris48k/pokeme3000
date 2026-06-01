import type { EditingSettings, Settings, Theme } from '../types'

interface Props {
  editingSettings: EditingSettings
  theme: Theme
  onSettingChange: (key: keyof Settings, value: string) => void
  onSave: () => void
  onToggleTheme: () => void
  onClose: () => void
}

export default function SettingsModal({ editingSettings, theme, onSettingChange, onSave, onToggleTheme, onClose }: Props) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <span className="settings-modal-title">Settings</span>
          <button className="settings-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-modal-body">
          <label className="setting-row">
            <span>Theme</span>
            <button className="theme-btn" onClick={onToggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </label>

          <label className="setting-row">
            <span>Window start</span>
            <input
              type="time"
              value={editingSettings.windowStart}
              onChange={(e) => onSettingChange('windowStart', e.target.value)}
            />
          </label>
          <label className="setting-row">
            <span>Window end</span>
            <input
              type="time"
              value={editingSettings.windowEnd}
              onChange={(e) => onSettingChange('windowEnd', e.target.value)}
            />
          </label>
          <label className="setting-row">
            <span>Pokes per day</span>
            <input
              type="number"
              min="1"
              max="99"
              value={editingSettings.alarmsPerDay}
              onChange={(e) => onSettingChange('alarmsPerDay', e.target.value)}
            />
          </label>

          <button className="btn-primary save-btn" onClick={() => { onSave(); onClose() }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
