import { CHAPTERS, findLesson, lessonContext } from "../course"
import { Difficulty, EXERCISE_KINDS } from "../course/types"
import { answerUnits, generateLesson, kindCounts } from "./lesson_gen"
import { tokenize } from "./morse"

function allLessons() {
  return CHAPTERS.flatMap(c => [...c.lessons, c.test].map((_, i) => findLesson(c.id, i)!))
}

describe("kindCounts", () => {
  it("adds up to the count asked for", () => {
    for (const d of [1, 2, 3, 4, 5] as Difficulty[]) {
      for (const n of [4, 8, 12, 20]) {
        const total = [...kindCounts(d, n).values()].reduce((a, b) => a + b, 0)
        expect(total).toBe(n)
      }
    }
  })

  it("keeps the easiest lessons to the easiest exercises", () => {
    const counts = kindCounts(1, 8)
    expect(counts.get("tap")).toBeUndefined()
    expect(counts.get("listenReadTiles")).toBe(6)
  })

  it("uses every kind in a test", () => {
    expect(kindCounts(5, 12).size).toBe(EXERCISE_KINDS.length)
  })
})

describe("generateLesson", () => {
  it("is the same for the same seed", () => {
    const ref = findLesson("c1", 5)!
    const a = generateLesson(ref.lesson, lessonContext(ref), 8, 42)
    const b = generateLesson(ref.lesson, lessonContext(ref), 8, 42)
    expect(a).toEqual(b)
  })

  it("always offers the right tiles, plus some wrong ones, for every lesson", () => {
    for (const ref of allLessons()) {
      for (let seed = 1; seed <= 20; seed++) {
        const exercises = generateLesson(ref.lesson, lessonContext(ref), 8, seed)
        expect(exercises.length).toBe(ref.lesson.exerciseCount ?? 8)
        for (const ex of exercises) {
          if (ex.tiles.length == 0) continue
          const labels = ex.tiles.map(t => t.label)
          // every answer tile is on offer, as many times as it's needed
          const pool = [...labels]
          for (const a of ex.answer) {
            const i = pool.indexOf(a)
            expect(i).not.toBe(-1)
            pool.splice(i, 1)
          }
          // and there's something wrong to choose too
          expect(pool.length).toBeGreaterThanOrEqual(1)
          for (const wrong of pool) {
            expect(ex.answer).not.toContain(wrong)
          }
        }
      }
    }
  })

  it("asks about every new item when there's room", () => {
    const ref = findLesson("c1", 1)!
    const exercises = generateLesson(ref.lesson, lessonContext(ref), 8, 3)
    const asked = new Set(exercises.map(e => e.item.text))
    for (const item of ref.lesson.newItems) {
      expect(asked).toContain(item.text)
    }
  })
})

describe("the course", () => {
  it("only uses letters taught by then", () => {
    for (const ref of allLessons()) {
      const known = new Set(lessonContext(ref).knownLetters)
      // prosigns are taught as whole signals
      for (const item of [...ref.lesson.newItems, ...(ref.lesson.reviewItems ?? [])]) {
        for (const letter of tokenize(item.text).flat()) {
          if (!letter.startsWith("<")) {
            expect([ref.lesson.id, letter, known.has(letter)]).toEqual([ref.lesson.id, letter, true])
          }
        }
      }
    }
  })

  it("splits answers into letters or words", () => {
    expect(answerUnits("TEA")).toEqual(["T", "E", "A"])
    expect(answerUnits("I AM")).toEqual(["I", "AM"])
    expect(answerUnits("<SOS>")).toEqual(["<SOS>"])
  })
})
