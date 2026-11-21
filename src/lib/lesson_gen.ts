// Making a lesson's exercises from its definition: which kinds of exercise, which
// items they ask about, and the tiles to choose from, with some wrong ones among them.

import { Difficulty, EXERCISE_KINDS, ExerciseKind, Item, LessonDef } from "../course/types"
import { codeDistance, displayText, letterCode, LETTERS, tokenize } from "./morse"
import { Rng, seededRng, shuffle } from "./random"

export interface Tile {
  id: string
  label: string // text, or a code (dots and dashes) for writing exercises
}

export interface Exercise {
  kind: ExerciseKind
  item: Item
  tiles: Tile[] // empty for typed and tapped answers
  answer: string[] // the labels of the right tiles, in order
}

// what the learner knows by this lesson, for choosing wrong answers they'll recognise
export interface LessonContext {
  knownLetters: string[]
  knownWords: string[]
}

// the share of each kind of exercise at each difficulty, easiest kinds first
const MIX: Record<Difficulty, Partial<Record<ExerciseKind, number>>> = {
  1: { listenReadTiles: 6, writeTiles: 2 },
  2: { listenReadTiles: 4, writeTiles: 2, listenTiles: 2 },
  3: { listenReadTiles: 2, writeTiles: 2, listenTiles: 2, listenReadText: 1, tap: 1 },
  4: { writeTiles: 1, listenTiles: 2, listenReadText: 1, listenText: 2, tap: 2 },
  5: { listenReadTiles: 1, writeTiles: 1, listenTiles: 1, listenReadText: 1, listenText: 1, tap: 1 },
}

const REVIEW_SHARE = 0.3

// kindCounts shares count exercises among the kinds by the mix's weights
export function kindCounts(difficulty: Difficulty, count: number): Map<ExerciseKind, number> {
  const weights = MIX[difficulty]
  const kinds = EXERCISE_KINDS.filter(k => (weights[k] ?? 0) > 0)
  const total = kinds.reduce((sum, k) => sum + weights[k]!, 0)
  const exact = kinds.map(k => (weights[k]! * count) / total)
  const counts = exact.map(Math.floor)
  // the rest go to the biggest remainders, the easier kind winning a tie
  const order = kinds.map((_, i) => i).sort((a, b) => (exact[b] - counts[b]) - (exact[a] - counts[a]) || a - b)
  for (let i = 0; counts.reduce((s, c) => s + c, 0) < count; i++) {
    counts[order[i % order.length]]++
  }
  return new Map(kinds.map((k, i) => [k, counts[i]]))
}

export function generateLesson(
  lesson: LessonDef,
  context: LessonContext,
  count: number,
  seed: number,
): Exercise[] {
  const rng = seededRng(seed)
  const n = lesson.exerciseCount ?? count
  const counts = kindCounts(lesson.difficulty, n)
  // easiest first, so a lesson gets a little harder as it goes
  const kinds: ExerciseKind[] = []
  for (const kind of EXERCISE_KINDS) {
    for (let i = 0; i < (counts.get(kind) ?? 0); i++) {
      kinds.push(kind)
    }
  }
  const items = pickItems(lesson, n, rng)
  return kinds.map((kind, i) => makeExercise(kind, items[i], context, rng))
}

// pickItems chooses which item each exercise asks about: every new item at least once
// where there's room, some review, and never the same one twice running
function pickItems(lesson: LessonDef, n: number, rng: Rng): Item[] {
  const review = lesson.reviewItems ?? []
  const numReview = review.length > 0 ? Math.round(n * REVIEW_SHARE) : 0
  const fromPool = (pool: Item[], k: number): Item[] => {
    const out: Item[] = []
    while (out.length < k) {
      out.push(...shuffle(pool, rng))
    }
    return out.slice(0, k)
  }
  const picked = shuffle([
    ...fromPool(lesson.newItems, n - numReview),
    ...fromPool(review, numReview),
  ], rng)
  for (let i = 1; i < picked.length; i++) {
    if (picked[i].text == picked[i - 1].text) {
      const j = picked.findIndex((p, k) => k > i && p.text != picked[i].text && p.text != picked[k - 1]?.text)
      if (j != -1) {
        ;[picked[i], picked[j]] = [picked[j], picked[i]]
      }
    }
  }
  return picked
}

export function makeExercise(kind: ExerciseKind, item: Item, context: LessonContext, rng: Rng): Exercise {
  if (kind == "listenReadText" || kind == "listenText" || kind == "tap") {
    return { kind, item, tiles: [], answer: [] }
  }
  const units = answerUnits(item.text)
  const isPhrase = tokenize(item.text).length > 1
  let answer: string[]
  let wrong: string[]
  if (kind == "writeTiles") {
    answer = isPhrase ? tokenize(item.text).map(w => w.map(letterCode).join(" ")) : units.map(letterCode)
    wrong = isPhrase
      ? similarWords(units, context, rng).map(w => tokenize(w)[0].map(letterCode).join(" "))
      : similarLetters(units, context, rng).map(letterCode)
  } else {
    answer = units.map(displayText)
    wrong = (isPhrase ? similarWords(units, context, rng) : similarLetters(units, context, rng)).map(displayText)
  }
  wrong = [...new Set(wrong.filter(w => !answer.includes(w)))].slice(0, distractorCount(answer.length))
  const tiles = shuffle([...answer, ...wrong], rng).map((label, i) => ({ id: `t${i}`, label }))
  return { kind, item, tiles, answer }
}

// answerUnits are the pieces an answer is built from: the letters of a word, or the
// words of a phrase
export function answerUnits(text: string): string[] {
  const words = tokenize(text)
  return words.length > 1 ? words.map(w => w.join("")) : words[0] ?? []
}

function distractorCount(answerLength: number): number {
  return answerLength <= 1 ? 3 : answerLength <= 3 ? 4 : 5
}

// similarLetters are letters that are easy to mix up with the answer's: close in code,
// preferring those already learned
function similarLetters(units: string[], context: LessonContext, rng: Rng): string[] {
  const known = new Set(context.knownLetters)
  const candidates = LETTERS.filter(l => !units.includes(l))
  const score = (l: string) => {
    const nearest = Math.min(...units.map(u => codeDistance(letterCode(u), letterCode(l))))
    return nearest + (known.has(l) ? 0 : 1.5) + rng() * 0.9
  }
  return candidates
    .map(l => ({ l, s: score(l) }))
    .sort((a, b) => a.s - b.s)
    .map(c => c.l)
    .slice(0, 6)
}

// similarWords are other known words, preferring those the same length as the answer's
function similarWords(units: string[], context: LessonContext, rng: Rng): string[] {
  const words = context.knownWords.filter(w => !w.includes(" ") && !units.includes(w))
  const lengths = units.map(u => u.length)
  const score = (w: string) => Math.min(...lengths.map(n => Math.abs(n - w.length))) + rng() * 1.5
  return words.map(w => ({ w, s: score(w) })).sort((a, b) => a.s - b.s).map(c => c.w).slice(0, 6)
}
