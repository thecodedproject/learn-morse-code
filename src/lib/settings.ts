// The learner's settings, and remembering them from one visit to the next.

export const THEMES = ["light", "dark"] as const
export type Theme = typeof THEMES[number]

export const SPEEDS = ["slower", "normal", "faster"] as const
export type Speed = typeof SPEEDS[number]

export const SPEED_FACTOR: Record<Speed, number> = { slower: 0.7, normal: 1, faster: 1.4 }

export const MIN_TONE = 400
export const MAX_TONE = 1000
export const MIN_EXERCISES = 4
export const MAX_EXERCISES = 20

export interface Settings {
  speed: Speed // scales each lesson's listening speed
  toneHz: number
  volume: number // 0-1
  exerciseCount: number // per lesson; tests set their own
  keyWpm: number // the tapping speed expected before the keyer has learnt the learner's own
}

export const DEFAULT_SETTINGS: Settings = {
  speed: "normal",
  toneHz: 600,
  volume: 0.7,
  exerciseCount: 8,
  keyWpm: 10,
}

const SETTINGS_KEY = "learn-morse.settings"
const THEME_KEY = "learn-morse.theme"

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// parseSettings reads settings saved earlier, keeping whatever of them is still good and
// taking the default for the rest, so a missing or damaged save never breaks the page
export function parseSettings(saved: string | null): Settings {
  let raw: any
  try {
    raw = saved == null ? {} : JSON.parse(saved)
  } catch {
    raw = {}
  }
  if (raw == null || typeof raw != "object") {
    raw = {}
  }
  const d = DEFAULT_SETTINGS
  const isNum = (v: unknown): v is number => typeof v == "number" && isFinite(v)
  return {
    speed: (SPEEDS as readonly unknown[]).includes(raw.speed) ? raw.speed : d.speed,
    toneHz: isNum(raw.toneHz) ? clamp(Math.round(raw.toneHz), MIN_TONE, MAX_TONE) : d.toneHz,
    volume: isNum(raw.volume) ? clamp(raw.volume, 0, 1) : d.volume,
    exerciseCount: isNum(raw.exerciseCount)
      ? clamp(Math.round(raw.exerciseCount), MIN_EXERCISES, MAX_EXERCISES) : d.exerciseCount,
    keyWpm: isNum(raw.keyWpm) ? clamp(Math.round(raw.keyWpm), 4, 30) : d.keyWpm,
  }
}

// storage can be missing or blocked (a private window, say), in which case settings just
// aren't remembered
export function loadSettings(): Settings {
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // not remembered
  }
}

// the theme chosen on an earlier visit, or else whichever the device is set to
export function loadTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if ((THEMES as readonly (string | null)[]).includes(stored)) {
      return stored as Theme
    }
  } catch {
    // fall through
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme == "dark" ? "#14161a" : "#f7f8fa")
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // not remembered
  }
}
