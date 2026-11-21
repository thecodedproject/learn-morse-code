import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react"
import { sameLetters } from "../../lib/grading"
import { decodePresses, Press } from "../../lib/keyer"
import { decodeLetter, displayText, letterCode, tokenize } from "../../lib/morse"
import { player } from "../../lib/player"
import { MorseCode, MorseGlyphs } from "../morse_code"
import { ExerciseProps } from "./types"

const MATCH_DELAY = 350 // ms after a release that decodes to the answer before it's marked

// TapExercise shows some English and the learner keys its code in on a big button
// (or the space bar), hearing the tone as they go. It's marked right as soon as what
// they've keyed reads as the answer; "Check" marks whatever is there.
export function TapExercise({ exercise, keyUnitMs, locked, onAnswer }: ExerciseProps): JSX.Element {
  const [presses, setPresses] = useState<Press[]>([])
  const [down, setDown] = useState(false)
  const [hint, setHint] = useState(false)
  const downAt = useRef<number>()
  const matchTimer = useRef<ReturnType<typeof setTimeout>>()
  const text = exercise.item.text

  // a prosign keyed run-together reads as its letters (see matchProsign), so it
  // compares like any other text
  const target = displayText(text)
  const keyed = decodePresses(presses, keyUnitMs)
  const keyedText = keyed.words.map(w => w.map(c => matchProsign(c, text)).join("")).join(" ")

  const press = () => {
    if (locked || downAt.current != undefined) {
      return
    }
    clearTimeout(matchTimer.current)
    downAt.current = performance.now()
    setDown(true)
    player.keyDown()
  }

  const release = () => {
    if (downAt.current == undefined) {
      return
    }
    const next = [...presses, { down: downAt.current, up: performance.now() }]
    downAt.current = undefined
    setDown(false)
    player.keyUp()
    setPresses(next)
    const words = decodePresses(next, keyUnitMs).words
    const now = words.map(w => w.map(c => matchProsign(c, text)).join("")).join(" ")
    if (sameLetters(now, target)) {
      matchTimer.current = setTimeout(() => onAnswer(true), MATCH_DELAY)
    }
  }

  // the space bar works the key too
  const latest = useRef({ press, release })
  latest.current = { press, release }
  useEffect(() => {
    const isKey = (e: KeyboardEvent) => e.code == "Space" && !(e.target instanceof HTMLInputElement)
    const onDown = (e: KeyboardEvent) => {
      if (isKey(e)) {
        e.preventDefault()
        if (!e.repeat) latest.current.press()
      }
    }
    const onUp = (e: KeyboardEvent) => {
      if (isKey(e)) {
        e.preventDefault()
        latest.current.release()
      }
    }
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
      clearTimeout(matchTimer.current)
      player.keyUp()
    }
  }, [])

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    player.ensure()
    press()
  }

  const clear = () => {
    clearTimeout(matchTimer.current)
    setPresses([])
  }

  return (
    <div className="exercise">
      <h2 className="exercisePrompt">Tap out the code for</h2>
      <div className="englishCard">{displayText(text)}</div>

      <div className="tapHint">
        {hint
          ? <MorseCode text={text} size="small" />
          : <button type="button" className="linkButton" onClick={() => setHint(true)}>Show me the code</button>}
      </div>

      <div className="tapOutput" aria-live="polite">
        {keyed.words.length == 0
          ? <span className="tapOutputHint">Hold for a dash, tap for a dot</span>
          : keyed.words.map((word, w) => (
            <span key={w} className="tapWord">
              {word.map((code, l) => (
                <span key={l} className="tapLetter">
                  <MorseGlyphs code={code} />
                  <span className="tapLetterText">{matchProsign(code, text)}</span>
                </span>
              ))}
            </span>
          ))}
      </div>

      <div className="tapKeyWrap">
        <button
          type="button"
          className={`tapKey${down ? " down" : ""}`}
          disabled={locked}
          onPointerDown={onPointerDown}
          onPointerUp={release}
          onPointerCancel={release}
          onContextMenu={e => e.preventDefault()}
          aria-label="Morse key: hold for a dash, tap for a dot, or use the space bar"
        >
          <span className="tapKeyKnob" />
        </button>
        <span className="tapKeyLabel">or use the space bar</span>
      </div>

      <div className="exerciseFooter">
        <button type="button" className="secondary" onClick={clear} disabled={locked || presses.length == 0}>Clear</button>
        <button
          type="button"
          className="primary"
          disabled={locked || presses.length == 0}
          onClick={() => {
            clearTimeout(matchTimer.current)
            onAnswer(sameLetters(keyedText, target))
          }}
        >
          Check
        </button>
      </div>
    </div>
  )
}

// matchProsign reads a keyed letter, recognising a prosign in the answer (which has no
// letter of its own)
function matchProsign(code: string, text: string): string {
  const letter = decodeLetter(code)
  if (letter != "?") {
    return letter
  }
  for (const l of tokenize(text).flat()) {
    if (l.startsWith("<") && letterCode(l) == code) {
      return l.slice(1, -1)
    }
  }
  return "?"
}
