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

  it("needs punctuation only where the answer has it", () => {
    expect(isCorrect("?", "?")).toBe(true)
    expect(isCorrect("", "?")).toBe(false)
    expect(isCorrect("how are you", "HOW ARE YOU?")).toBe(false)
    expect(isCorrect("how are you ?", "HOW ARE YOU?")).toBe(true)
    expect(isCorrect("yes,please.", "YES, PLEASE.")).toBe(true)
    expect(isCorrect("hello!", "HELLO")).toBe(true)
    expect(sameLetters("SEE YOU AT 5.", "SEE YOU AT 5.")).toBe(true)
    expect(sameLetters("SEE YOU AT 5", "SEE YOU AT 5.")).toBe(false)
  })
})
