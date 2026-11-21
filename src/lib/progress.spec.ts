import { parseProgress, recordScore } from "./progress"
import { parseSettings, DEFAULT_SETTINGS } from "./settings"

describe("progress", () => {
  it("survives a missing or damaged save", () => {
    expect(parseProgress(null)).toEqual({ lessons: {} })
    expect(parseProgress("{nope")).toEqual({ lessons: {} })
    expect(parseProgress(JSON.stringify({ lessons: { a: { best: "x" }, b: { best: 2, completed: true } } })))
      .toEqual({ lessons: { b: { best: 1, completed: true } } })
  })

  it("keeps the best score", () => {
    let p = recordScore({ lessons: {} }, "c1l1", 0.9, false)
    p = recordScore(p, "c1l1", 0.5, false)
    expect(p.lessons.c1l1).toEqual({ best: 0.9, completed: true })
  })

  it("only completes a test with a pass", () => {
    let p = recordScore({ lessons: {} }, "c1t", 0.75, true)
    expect(p.lessons.c1t.completed).toBe(false)
    p = recordScore(p, "c1t", 0.8, true)
    expect(p.lessons.c1t.completed).toBe(true)
  })
})

describe("settings", () => {
  it("falls back to the defaults", () => {
    expect(parseSettings("[1]")).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings(JSON.stringify({ speed: "warp", toneHz: 5000 })).toneHz).toBe(1000)
  })

  it("moves saves from before version 2 on to 12 exercises a lesson", () => {
    expect(parseSettings(JSON.stringify({ exerciseCount: 8, speed: "faster" })))
      .toEqual({ ...DEFAULT_SETTINGS, exerciseCount: 12, speed: "faster" })
    expect(parseSettings(JSON.stringify({ exerciseCount: 6, version: 2 })).exerciseCount).toBe(6)
  })
})
