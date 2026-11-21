import { decodePresses, Press } from "./keyer"
import { decode, encode } from "./morse"

// key sends text as presses at a given dot length, with each length and gap varied
// by up to `wobble` (a fraction) to imitate a human hand
function key(text: string, unit: number, wobble = 0, letterGap = 3, wordGap = 7): Press[] {
  let seed = 7
  const jitter = () => {
    seed = (seed * 16807) % 2147483647
    return 1 + wobble * (2 * (seed / 2147483647) - 1)
  }
  const presses: Press[] = []
  let t = 0
  encode(text).forEach((word, w) => {
    if (w > 0) t += wordGap * unit * jitter()
    word.forEach((code, l) => {
      if (l > 0) t += letterGap * unit * jitter()
      code.split("").forEach((el, i) => {
        if (i > 0) t += unit * jitter()
        const length = (el == "." ? 1 : 3) * unit * jitter()
        presses.push({ down: t, up: t + length })
        t += length
      })
    })
  })
  return presses
}

const read = (presses: Press[], unitMs = 120) => decode(decodePresses(presses, unitMs).words)

describe("keyer", () => {
  it("reads steady keying at different speeds", () => {
    for (const unit of [60, 120, 250]) {
      expect(read(key("HELLO WORLD", unit))).toBe("HELLO WORLD")
    }
  })

  it("reads uneven keying", () => {
    expect(read(key("MOST NOTE", 150, 0.25))).toBe("MOST NOTE")
  })

  it("reads a single kind of press against the expected speed", () => {
    expect(read(key("E", 100))).toBe("E")
    expect(read(key("T", 100))).toBe("T")
    expect(read(key("S", 90))).toBe("S")
    expect(read(key("O", 110))).toBe("O")
  })

  it("splits letters on a pause", () => {
    expect(read(key("ET", 120))).toBe("ET")
    expect(read(key("IT", 120, 0.2))).toBe("IT")
  })

  it("reads nothing from no presses", () => {
    expect(decodePresses([], 100).words).toEqual([])
  })
})
