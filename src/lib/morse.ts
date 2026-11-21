// The Morse code itself: the table, and turning text into code and back.
//
// Text is split into words, and words into "letters". A letter is a single character
// or a prosign written in angle brackets, such as <SOS>: a prosign is sent as one
// run-together letter, with no gaps between its parts.

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.", "=": "-...-",
  "!": "-.-.--", "'": ".----.", "-": "-....-", "@": ".--.-.",
}

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const DECODE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([ch, code]) => [code, ch]),
)

// tokenize splits text into words of letters, upper-cased. Anything with no code is
// dropped.
export function tokenize(text: string): string[][] {
  const words: string[][] = []
  for (const raw of text.toUpperCase().trim().split(/\s+/)) {
    const word: string[] = []
    const re = /<([A-Z0-9]+)>|./g
    let m: RegExpExecArray | null
    while ((m = re.exec(raw)) != null) {
      if (m[1] != undefined) {
        word.push(`<${m[1]}>`)
      } else if (MORSE[m[0]] != undefined) {
        word.push(m[0])
      }
    }
    if (word.length > 0) {
      words.push(word)
    }
  }
  return words
}

// letterCode is the code for one letter or prosign
export function letterCode(letter: string): string {
  if (letter.startsWith("<") && letter.endsWith(">")) {
    return letter.slice(1, -1).split("").map(ch => MORSE[ch] ?? "").join("")
  }
  const code = MORSE[letter.toUpperCase()]
  if (code == undefined) {
    throw new Error(`no Morse code for "${letter}"`)
  }
  return code
}

// encode turns text into words of letter codes
export function encode(text: string): string[][] {
  return tokenize(text).map(word => word.map(letterCode))
}

// decodeLetter reads one letter's code, or "?" for a code that isn't a letter
export function decodeLetter(code: string): string {
  return DECODE[code] ?? "?"
}

// decode reads words of letter codes back into text
export function decode(words: string[][]): string {
  return words.map(w => w.map(decodeLetter).join("")).join(" ")
}

// displayText is how text is shown to the learner: prosigns lose their brackets
export function displayText(text: string): string {
  return text.replace(/[<>]/g, "")
}

// formatCode writes text's code out, with spaces between letters and " / " between
// words, e.g. ".. - / .. ..."
export function formatCode(text: string): string {
  return encode(text).map(w => w.join(" ")).join(" / ")
}

// codeDistance is how different two codes are: the edit distance between them, where
// swapping a dot for a dash counts the same as adding or removing one
export function codeDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] == b[j - 1] ? 0 : 1))
      diag = up
    }
  }
  return prev[b.length]
}
