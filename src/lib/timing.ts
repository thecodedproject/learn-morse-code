// How long everything lasts when Morse is sent.
//
// The standard word PARIS (with the gap after it) takes 50 units, so at w words a
// minute one unit lasts 1.2 / w seconds. A dot is a unit, a dash three; a unit of
// silence separates the parts of a letter, three separate letters and seven words.
//
// Farnsworth timing sends each letter at a brisk character speed, so a letter keeps
// the rhythm it will have later on, but stretches the gaps between letters and words
// so the overall (effective) speed is slower and there is time to think.

import { encode } from "./morse"

export interface Timing {
  charWpm: number // the speed of each letter
  effWpm: number // the overall speed, with the gaps stretched
}

export const DEFAULT_TIMING: Timing = { charWpm: 18, effWpm: 6 }

export interface Element {
  start: number // seconds from the start
  duration: number
  kind: "." | "-"
  word: number
  letter: number // within its word
  index: number // within its letter
}

export interface Timeline {
  elements: Element[]
  duration: number // to the end of the last element
}

export function unitLength(wpm: number): number {
  return 1.2 / wpm
}

// gaps gives the silences between letters and between words, in seconds
export function gaps(timing: Timing): { letter: number, word: number } {
  const u = unitLength(timing.charWpm)
  if (timing.effWpm >= timing.charWpm) {
    return { letter: 3 * u, word: 7 * u }
  }
  // the total delay added to a PARIS-length word, spread over its 19 units of gap
  const c = timing.charWpm
  const e = timing.effWpm
  const delay = (60 * c - 37.2 * e) / (c * e)
  return { letter: (3 * delay) / 19, word: (7 * delay) / 19 }
}

// buildTimeline lays out text, or words of letter codes, element by element
export function buildTimeline(text: string | string[][], timing: Timing): Timeline {
  const code = typeof text == "string" ? encode(text) : text
  const u = unitLength(timing.charWpm)
  const gap = gaps(timing)
  const elements: Element[] = []
  let t = 0
  code.forEach((word, w) => {
    if (w > 0) {
      t += gap.word
    }
    word.forEach((code, l) => {
      if (l > 0) {
        t += gap.letter
      }
      code.split("").forEach((kind, i) => {
        if (i > 0) {
          t += u
        }
        const duration = kind == "." ? u : 3 * u
        elements.push({ start: t, duration, kind: kind as "." | "-", word: w, letter: l, index: i })
        t += duration
      })
    })
  })
  return { elements, duration: t }
}

// scaleTiming speeds timing up (factor > 1) or slows it down, keeping the effective
// speed no faster than the character speed
export function scaleTiming(timing: Timing, factor: number): Timing {
  const effWpm = Math.max(3, timing.effWpm * factor)
  return { charWpm: Math.max(timing.charWpm, effWpm), effWpm }
}

// slowTiming is for the "play it slowly" button: letters a little slower and much
// more room between them
export function slowTiming(timing: Timing): Timing {
  return { charWpm: Math.max(10, timing.charWpm * 0.75), effWpm: Math.max(3, timing.effWpm * 0.6) }
}
