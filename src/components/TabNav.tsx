import type { Tab } from '../types'

interface Props {
  tab: Tab
  onTabChange: (tab: Tab) => void
  scheduleDone: number
  scheduleTotal: number
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'items', label: '📋 Items' },
  { key: 'schedule', label: '📅 Schedule' },
]

export default function TabNav({ tab, onTabChange, scheduleDone, scheduleTotal }: Props) {
  return (
    <nav className="tabs">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          className={`tab ${tab === key ? 'active' : ''}`}
          onClick={() => onTabChange(key)}
        >
          {label}
          {key === 'schedule' && scheduleTotal > 0 && (
            <span className="tab-badge">{scheduleDone}/{scheduleTotal}</span>
          )}
        </button>
      ))}
    </nav>
  )
}
