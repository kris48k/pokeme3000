export const HABIT_SUGGESTIONS: string[] = [
  // Body
  'Drink water 💧',
  'Have a stretch 🙆',
  'Rest your eyes 👀',
  'Stand up & move 🚶',
  'Take a short walk 🌿',
  'Check your posture 🪑',
  'Take a deep breath 🫁',
  'Do a few squats 🏋️',
  'Roll your shoulders back 🔄',
  'Shake out your hands & wrists 🤲',
  'Stretch your neck slowly 🦒',
  'Put a sunscreen on 🌞',
  'Don\'t forget your vitamins 💊',
  'Floss today 🦷',
  // Food & drink
  'Eat something healthy 🍎',
  'Drink herbal tea 🍵',
  'Eat some fruit 🍓',
  // Mind
  'Check your mood 🧠',
  'Practice gratitude 🙏',
  'Rest your forehead 🤦‍♀️',
  'Step away from the screen 🖥️',
  'Do a 1-min meditation 🧘',
  'Write one thing you\'re proud of ✍️',
  'Check in with a friend 💬',
  'Put your phone down for 5 min 📵',
  // Focus & work
  'Clear one tab you don\'t need 🗂️',
  'Reply to that message you\'ve been ignoring 📩',
  'Take a proper break — not doom-scrolling 🛋️',
  'Write tomorrow\'s top 3 tasks 📋',
  'Save your work 💾',
]

import type { Alarm } from './types'

export function alarmStatus(alarm: Alarm): 'scheduled' | 'done' | 'dismissed' {
  if (!alarm.fired) return 'scheduled'
  if (alarm.result === 'done') return 'done'
  return 'dismissed'
}

export function formatTime(minuteOfDay: number): string {
  const d = new Date()
  d.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
