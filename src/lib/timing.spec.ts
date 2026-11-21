import { buildTimeline, gaps, unitLength } from "./timing"

describe("timing", () => {
  it("sends PARIS in 43 units, 50 with the gap after it", () => {
    const timing = { charWpm: 20, effWpm: 20 }
    const t = buildTimeline("PARIS", timing)
    expect(t.duration / unitLength(20)).toBeCloseTo(43)
    expect((t.duration + gaps(timing).word) * 20).toBeCloseTo(60)
  })

  it("stretches the gaps for Farnsworth timing, keeping the letters the same", () => {
    const timing = { charWpm: 18, effWpm: 6 }
    const t = buildTimeline("PARIS", timing)
    // a word a tenth of a minute long at 6 words a minute
    expect((t.duration + gaps(timing).word) * 6).toBeCloseTo(60)
    expect(t.elements[0].duration).toBeCloseTo(unitLength(18))
  })

  it("marks each element with its place", () => {
    const t = buildTimeline("A N", { charWpm: 20, effWpm: 20 })
    expect(t.elements.map(e => [e.kind, e.word, e.letter, e.index])).toEqual([
      [".", 0, 0, 0], ["-", 0, 0, 1], ["-", 1, 0, 0], [".", 1, 0, 1],
    ])
  })
})
