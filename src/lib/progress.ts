// How the learner has done: the best score in each lesson, and which chapter tests
// they have passed. Kept in the browser between visits.

import { PASS_MARK } from "../course/types"

export interface LessonProgress {
  best: number // 0-1
  completed: boolean
}

export interface Progress {
  lessons: Record<string, LessonProgress> // by lesson id; tests use their own id too
}

export const EMPTY_PROGRESS: Progress = { lessons: {} }

const PROGRESS_KEY = "learn-morse.progress"

export function parseProgress(saved: string | null): Progress {
  let raw: any
  try {
    raw = saved == null ? {} : JSON.parse(saved)
  } catch {
    return { lessons: {} }
  }
  const lessons: Record<string, LessonProgress> = {}
  if (raw != null && typeof raw == "object" && raw.lessons != null && typeof raw.lessons == "object") {
    for (const [id, p] of Object.entries<any>(raw.lessons)) {
      if (p != null && typeof p == "object" && typeof p.best == "number" && isFinite(p.best)) {
        lessons[id] = { best: Math.min(1, Math.max(0, p.best)), completed: p.completed === true }
      }
    }
  }
  return { lessons }
}

// recordScore keeps the better of the new score and the old. A lesson is completed by
// finishing it; a test only by passing it.
export function recordScore(progress: Progress, id: string, score: number, isTest: boolean): Progress {
  const old = progress.lessons[id]
  const completed = (old?.completed ?? false) || !isTest || score >= PASS_MARK
  return {
    lessons: {
      ...progress.lessons,
      [id]: { best: Math.max(old?.best ?? 0, score), completed },
    },
  }
}

export function loadProgress(): Progress {
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY))
  } catch {
    return { lessons: {} }
  }
}

export function saveProgress(progress: Progress): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // not remembered
  }
}
