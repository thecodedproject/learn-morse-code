import { FormEvent, useEffect, useState } from "react"
import { isCorrect } from "../../lib/grading"
import { PlayState, player } from "../../lib/player"
import { slowTiming } from "../../lib/timing"
import { MorseCode } from "../morse_code"
import { TilePicker } from "../tile_picker"
import { ExerciseProps, tilesCorrect } from "./types"

interface Props extends ExerciseProps {
  showCode: boolean // listen and read, or listen only
  answer: "tiles" | "text"
}

const AUTOPLAY_DELAY = 450 // ms: let the exercise slide in first

// ListenExercise plays some Morse, and the learner says what it was by picking tiles
// or typing it in. In the easier version they see the code too, lit up as it plays.
export function ListenExercise({ exercise, timing, locked, onAnswer, showCode, answer }: Props): JSX.Element {
  const [playState, setPlayState] = useState<PlayState>()
  const [playing, setPlaying] = useState(false)
  const [placed, setPlaced] = useState<string[]>([])
  const [typed, setTyped] = useState("")
  const text = exercise.item.text

  const play = (slow = false) => {
    setPlaying(true)
    player.play(text, slow ? slowTiming(timing) : timing, setPlayState).then(() => setPlaying(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => play(), AUTOPLAY_DELAY)
    return () => {
      clearTimeout(timer)
      player.stop()
    }
  }, [])

  const check = (e?: FormEvent) => {
    e?.preventDefault()
    if (locked) {
      return
    }
    onAnswer(answer == "tiles" ? tilesCorrect(exercise, placed) : isCorrect(typed, text))
  }

  const ready = answer == "tiles" ? placed.length > 0 : typed.trim() != ""
  const isPhrase = exercise.answer.length > 0 && exercise.answer.some(a => a.length > 1)

  return (
    <form className="exercise" onSubmit={check}>
      <h2 className="exercisePrompt">
        {answer == "tiles" ? "What do you hear?" : "Type what you hear"}
      </h2>

      <div className="listenStage">
        <div className="playButtons">
          <button type="button" className={`playBig${playing ? " playing" : ""}`} onClick={() => play()} aria-label="Play again">
            <SpeakerIcon />
          </button>
          <button type="button" className="playSlow" onClick={() => play(true)} aria-label="Play slowly" title="Play slowly">
            <TortoiseIcon />
          </button>
        </div>
        {showCode && (
          <div className="codeCard">
            <MorseCode text={text} playState={playState} />
          </div>
        )}
      </div>

      <div className="exerciseAnswer">
        {answer == "tiles"
          ? <TilePicker tiles={exercise.tiles} placed={placed} onChange={setPlaced} disabled={locked} wide={isPhrase} />
          : (
            <input
              className="textAnswer"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              disabled={locked}
              placeholder="Type it here"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Your answer"
            />
          )}
      </div>

      <div className="exerciseFooter">
        <button type="submit" className="primary" disabled={!ready || locked}>Check</button>
      </div>
    </form>
  )
}

export function SpeakerIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function TortoiseIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15.5c0-4 3.4-7 7.5-7s7.5 3 7.5 7z" />
      <path d="M18 13.5h1.5a2 2 0 0 0 0-4H18" />
      <path d="M6 15.5v2.5M15 15.5v2.5" />
      <path d="M7 11.5l2 2 2-2 2 2 2-2" />
    </svg>
  )
}
