import { isCorrect, normalize, sameLetters } from "./grading"

describe("grading", () => {
  it("ignores case, spacing and punctuation", () => {
    expect(normalize("  hello,   World! ")).toBe("HELLO WORLD")
    expect(isCorrect("hello world", "HELLO WORLD")).toBe(true)
    expect(isCorrect("sos", "<SOS>")).toBe(true)
  })

  it("marks wrong answers wrong", () => {
    expect(isCorrect("helo world", "HELLO WORLD")).toBe(false)
    expect(isCorrect("", "")).toBe(false)
  })

  it("accepts alternatives", () => {
    expect(isCorrect("OK", "OKAY", ["OK"])).toBe(true)
  })

  it("can compare ignoring word gaps", () => {
    expect(sameLetters("TO MATO", "TOMATO")).toBe(true)
    expect(sameLetters("TOMATOE", "TOMATO")).toBe(false)
  })
})
