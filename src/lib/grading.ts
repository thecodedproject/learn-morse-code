// Marking answers. Case and spacing never count against an answer, and nor does stray
// punctuation, unless the answer is itself punctuation (a question mark, say), when it
// has to be there.

const PUNCTUATION = ".,?/=!'\\-@" // the marks with a code of their own
const HAS_PUNCTUATION = new RegExp(`[${PUNCTUATION}]`)

export function normalize(text: string, keepPunctuation = false): string {
  let t = text
    .toUpperCase()
    .replace(keepPunctuation ? new RegExp(`[^A-Z0-9 ${PUNCTUATION}]+`, "g") : /[^A-Z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (keepPunctuation) {
    // "YES , PLEASE ." and "YES,PLEASE." are both fine for "YES, PLEASE."
    t = t.replace(new RegExp(` ?([${PUNCTUATION}]) ?`, "g"), "$1")
  }
  return t
}

// strictness follows the expected answer: punctuation in it has to be in the answer
function keepsPunctuation(expected: string): boolean {
  return HAS_PUNCTUATION.test(expected.replace(/[<>]/g, ""))
}

export function isCorrect(given: string, expected: string, alternatives: string[] = []): boolean {
  return [expected, ...alternatives].some(e => {
    const keep = keepsPunctuation(e)
    const g = normalize(given, keep)
    return g != "" && normalize(e, keep) == g
  })
}

// sameLetters compares ignoring the gaps between words, for tapped answers of a single
// word, where a long pause shouldn't split the word in two
export function sameLetters(given: string, expected: string): boolean {
  const keep = keepsPunctuation(expected)
  const strip = (s: string) => normalize(s, keep).replace(/ /g, "")
  return strip(given) != "" && strip(given) == strip(expected)
}
