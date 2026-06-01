export interface Settings {
  windowStart: string
  windowEnd: string
  alarmsPerDay: number
}

export interface EditingSettings {
  windowStart: string
  windowEnd: string
  alarmsPerDay: string
}

export interface Alarm {
  minuteOfDay: number
  itemIndex: number
  fired: boolean
  result?: 'done' | 'dismissed'
}

export interface StoredSchedule {
  date: string
  alarms: Alarm[]
  itemCount: number
}

export interface ActiveAlarmState {
  item: string
  index: number
}

export type Tab = 'items' | 'schedule'
export type PermStatus = NotificationPermission | 'unsupported'
export type Theme = 'dark' | 'light'
