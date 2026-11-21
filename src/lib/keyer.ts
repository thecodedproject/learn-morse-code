// Reading the learner's own tapping. Each press of the key is a dot or a dash
// depending on how long it is held, and the silences between presses say where one
// letter, or word, ends and the next begins.
//
// People tap at their own pace, and beginners tap slowly and unevenly, so rather than
// insist on an exact speed the keyer looks for the learner's own short and long
// presses, and measures the gaps against their own dots.

export interface Press {
  down: number // ms
  up: number // ms
}

export interface Keyed {
  words: string[][] // words of letter codes, like the output of encode()
  unit: number // the dot length it settled on, in ms
}

// unitMs is the dot length expected when there is nothing else to go on
export function decodePresses(presses: Press[], unitMs: number): Keyed {
  if (presses.length == 0) {
    return { words: [], unit: unitMs }
  }
  const lengths = presses.map(p => Math.max(0, p.up - p.down))
  const threshold = dashThreshold(lengths, unitMs)
  const dots = lengths.filter(l => l < threshold)
  const dashes = lengths.filter(l => l >= threshold)
  // the learner's own unit, from their dots and a third of each of their dashes
  const unit = median([...dots, ...dashes.map(d => d / 3)])
  // gaps are measured against that unit (but not one implausibly short). Between the
  // parts of a letter is one unit, between letters three and between words seven, so
  // the splits come roughly between, leaving room for an uneven hand.
  const gapUnit = Math.max(unit, unitMs * 0.4)
  const letterGap = gapUnit * 2
  const wordGap = gapUnit * 4.5

  const words: string[][] = [[""]]
  presses.forEach((p, i) => {
    if (i > 0) {
      const gap = p.down - presses[i - 1].up
      const word = words[words.length - 1]
      if (gap >= wordGap) {
        words.push([""])
      } else if (gap >= letterGap) {
        word.push("")
      }
    }
    const word = words[words.length - 1]
    word[word.length - 1] += lengths[i] < threshold ? "." : "-"
  })
  return { words, unit }
}

// dashThreshold finds the press length that separates dots from dashes. With both
// kinds tapped it is the biggest jump between one press length and the next; with
// only one kind it falls back on the expected speed.
export function dashThreshold(lengths: number[], unitMs: number): number {
  const fallback = unitMs * 2
  const sorted = [...lengths].sort((a, b) => a - b)
  const min = Math.max(1, sorted[0])
  const max = sorted[sorted.length - 1]
  if (sorted.length < 2 || max / min < 2.2) {
    return fallback
  }
  let best = 0
  let at = fallback
  for (let i = 1; i < sorted.length; i++) {
    const ratio = sorted[i] / Math.max(1, sorted[i - 1])
    if (ratio > best) {
      best = ratio
      at = Math.sqrt(sorted[i] * Math.max(1, sorted[i - 1]))
    }
  }
  // a dash is three dots, so the split should lie somewhere near twice a dot
  return Math.min(unitMs * 5, Math.max(unitMs * 1.1, at))
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}
