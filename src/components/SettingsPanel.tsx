import type { EditingSettings, Settings } from '../types'

interface Props {
  editingSettings: EditingSettings
  onSettingChange: (key: keyof Settings, value: string) => void
  onSave: () => void
}

export default function SettingsPanel({ editingSettings, onSettingChange, onSave }: Props) {
  return (
    <section className="panel settings-panel">
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
        <span>Alarms per day</span>
        <input
          type="number"
          min="1"
          max="24"
          value={editingSettings.alarmsPerDay}
          onChange={(e) => onSettingChange('alarmsPerDay', e.target.value)}
        />
      </label>
      <button className="btn-primary save-btn" onClick={onSave}>
        Save &amp; rebuild schedule
      </button>
    </section>
  )
}
