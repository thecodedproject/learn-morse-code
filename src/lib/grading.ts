// Marking answers. Case, spacing and stray punctuation never count against an
// answer; only the letters and numbers do.

export function normalize(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function isCorrect(given: string, expected: string, alternatives: string[] = []): boolean {
  const g = normalize(given)
  return g != "" && [expected, ...alternatives].some(e => normalize(e) == g)
}

// sameLetters compares ignoring the gaps between words, for tapped answers of a single
// word, where a long pause shouldn't split the word in two
export function sameLetters(given: string, expected: string): boolean {
  const strip = (s: string) => normalize(s).replace(/ /g, "")
  return strip(given) != "" && strip(given) == strip(expected)
}
