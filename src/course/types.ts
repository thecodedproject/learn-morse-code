import { Timing } from "../lib/timing"

export const EXERCISE_KINDS = [
  "listenReadTiles", // hear it and see the code, pick tiles: the easiest
  "writeTiles", // see English, pick the code from tiles
  "listenTiles", // hear it only, pick tiles
  "listenReadText", // hear it and see the code, type the answer
  "listenText", // hear it only, type the answer
  "tap", // see English, key it in: the hardest
] as const
export type ExerciseKind = typeof EXERCISE_KINDS[number]

export interface Item {
  text: string // letters, a word or a phrase; prosigns in angle brackets, e.g. "<SOS>"
  meaning?: string // for abbreviations: "73" means "best regards"
}

export type Difficulty = 1 | 2 | 3 | 4 | 5

export interface LessonDef {
  id: string
  title: string
  intro?: string // a line or two shown before the lesson starts
  newItems: Item[]
  reviewItems?: Item[]
  difficulty: Difficulty
  speed?: Partial<Timing>
  exerciseCount?: number // overrides the setting
}

export interface ChapterDef {
  id: string
  title: string
  description: string
  speed: Timing // the chapter's usual speed, before any lesson's own
  lessons: LessonDef[]
  test: LessonDef
}

export const PASS_MARK = 0.8
