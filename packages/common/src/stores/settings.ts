import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'neon'

export interface WorkingHours {
  start: string // e.g., '09:00'
  end: string   // e.g., '17:00'
  days: number[] // 0-6 (Sun-Sat)
}

export interface SettingsState {
  theme: Theme
  locale: string
  timezone: string
  workingHours: WorkingHours
  ai:
    | {
        enableEmbeddings: boolean
        providers: {
          openai?: boolean
          gemini?: boolean
        }
      }
    | undefined

  setTheme: (t: Theme) => void
  setLocale: (l: string) => void
  setTimezone: (tz: string) => void
  setWorkingHours: (wh: WorkingHours) => void
  setAI: (ai: NonNullable<SettingsState['ai']>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  locale: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  workingHours: { start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
  ai: { enableEmbeddings: false, providers: { openai: true, gemini: false } },

  setTheme: (t) => set({ theme: t }),
  setLocale: (l) => set({ locale: l }),
  setTimezone: (tz) => set({ timezone: tz }),
  setWorkingHours: (wh) => set({ workingHours: wh }),
  setAI: (ai) => set({ ai }),
}))
