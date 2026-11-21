import { codeDistance, decode, displayText, encode, formatCode, MORSE, tokenize } from "./morse"

describe("morse", () => {
  it("round-trips every character in the table", () => {
    for (const ch of Object.keys(MORSE)) {
      expect(decode(encode(ch))).toBe(ch)
    }
  })

  it("round-trips words and phrases", () => {
    expect(decode(encode("hello  world"))).toBe("HELLO WORLD")
  })

  it("sends a prosign as one letter", () => {
    expect(tokenize("<SOS>")).toEqual([["<SOS>"]])
    expect(encode("<SOS>")).toEqual([["...---..."]])
    expect(displayText("<SOS>")).toBe("SOS")
  })

  it("formats code for display", () => {
    expect(formatCode("it is")).toBe(".. - / .. ...")
  })

  it("measures how alike two codes are", () => {
    expect(codeDistance(".-", "-.")).toBe(2)
    expect(codeDistance(".-", ".-.")).toBe(1)
    expect(codeDistance("...", "...")).toBe(0)
  })
})
