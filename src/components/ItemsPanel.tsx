import { useState } from 'react'
import type { Alarm } from '../types'
import { formatTime, HABIT_SUGGESTIONS } from '../utils'
import ItemCard from './ItemCard'

interface Props {
  items: string[]
  schedule: Alarm[]
  newItem: string
  onNewItemChange: (value: string) => void
  onAddItem: (e: { preventDefault(): void }) => void
  onAddSuggestion: (habit: string) => void
  onRemoveItem: (index: number) => void
  onReschedule: (itemIndex: number, changes: Array<{ oldMinute: number; newMinute: number }>) => void
  onAddPoke: (itemIndex: number) => void
  onRemovePoke: (itemIndex: number, minute: number) => void
  newlyAddedItem: string | null
  onClearNewItem: () => void
}

export default function ItemsPanel({ items, schedule, newItem, onNewItemChange, onAddItem, onAddSuggestion, onRemoveItem, onReschedule, onAddPoke, onRemovePoke, newlyAddedItem, onClearNewItem }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [inputFocused, setInputFocused] = useState(false)

  const selectedAlarms = selectedIndex !== null
    ? schedule.filter((a) => a.itemIndex === selectedIndex)
    : []

  const autocompleteSuggestions = newItem.trim().length > 0
    ? HABIT_SUGGESTIONS
        .filter((h) => !items.includes(h) && h.toLowerCase().includes(newItem.toLowerCase().trim()))
        .slice(0, 6)
    : []

  const showDropdown = inputFocused && autocompleteSuggestions.length > 0

  const sortedItems = [...items.entries()]
    .map(([i, item]) => ({ i, item, nextAlarm: schedule.find((a) => a.itemIndex === i && !a.fired) }))
    .sort((a, b) => {
      if (!a.nextAlarm && !b.nextAlarm) return 0
      if (!a.nextAlarm) return 1
      if (!b.nextAlarm) return -1
      return a.nextAlarm.minuteOfDay - b.nextAlarm.minuteOfDay
    })

  return (
    <section className="panel">
      <div className="add-form-wrapper">
        <form className="add-form" onSubmit={onAddItem}>
          <input
            className="text-input"
            value={newItem}
            onChange={(e) => onNewItemChange(e.target.value)}
            placeholder="New poke"
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          <button className="btn-primary" type="submit">Add</button>
        </form>

        {showDropdown && (
          <ul className="autocomplete-list">
            {autocompleteSuggestions.map((habit) => (
              <li key={habit}>
                <button
                  className="autocomplete-item"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onNewItemChange(habit)
                    setInputFocused(false)
                  }}
                >
                  {habit}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length === 0 ? (
        <p className="empty">No items yet. Add something above.</p>
      ) : (
        <ul className="item-list">
          {sortedItems.map(({ i, item, nextAlarm }) => (
            <li
              key={i}
              className={`item-row item-row--clickable${item === newlyAddedItem ? ' item-row--new' : ''}`}
              onClick={() => setSelectedIndex(i)}
              onAnimationEnd={item === newlyAddedItem ? onClearNewItem : undefined}
            >
              <div className="item-info">
                <span className={`item-schedule ${!nextAlarm ? 'item-schedule--none' : ''}`}>
                  {nextAlarm ? `next poke at ${formatTime(nextAlarm.minuteOfDay)}` : 'not scheduled today'}
                </span>
                <span>{item}</span>
              </div>
              <button className="remove-btn" onClick={(e) => { e.stopPropagation(); onRemoveItem(i) }}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {selectedIndex !== null && (
        <ItemCard
          item={items[selectedIndex]}
          alarms={selectedAlarms}
          onReschedule={(changes) => onReschedule(selectedIndex, changes)}
          onAddPoke={() => onAddPoke(selectedIndex)}
          onRemovePoke={(minute) => onRemovePoke(selectedIndex, minute)}
          onClose={() => setSelectedIndex(null)}
        />
      )}

      <div className="suggestions">
        <p className="suggestions-label">Quick add</p>
        <div className="suggestions-grid">
          {HABIT_SUGGESTIONS.filter((h) => !items.includes(h)).map((habit) => (
            <button
              key={habit}
              className="suggestion-chip"
              onClick={() => onAddSuggestion(habit)}
            >
              {habit}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
