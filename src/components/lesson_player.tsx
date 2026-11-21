import { useEffect, useMemo, useRef, useState } from "react"
import { LessonRef, lessonContext, lessonTiming } from "../course"
import { ExerciseKind } from "../course/types"
import { Exercise, generateLesson } from "../lib/lesson_gen"
import { displayText } from "../lib/morse"
import { PlayState, player } from "../lib/player"
import { Settings, SPEED_FACTOR } from "../lib/settings"
import { scaleTiming, Timing } from "../lib/timing"
import { ListenExercise, SpeakerIcon } from "./exercises/listen_exercise"
import { TapExercise } from "./exercises/tap_exercise"
import { ExerciseProps } from "./exercises/types"
import { WriteTilesExercise } from "./exercises/write_tiles_exercise"
import { LessonResult } from "./lesson_result"
import { MorseCode } from "./morse_code"
import "./lesson_player.css"

interface Props {
  lessonRef: LessonRef
  settings: Settings
  onFinish: (score: number) => void
  onQuit: () => void
  onNext?: () => void
}

type Phase = "intro" | "exercises" | "result"

const ADVANCE_DELAY = 1000 // ms a right answer is shown before moving on
const SLIDE_OUT = 300 // ms; matches .exerciseSlide.leaving in the CSS

// LessonPlayer runs a lesson: the new letters or words to start with, then the
// exercises one at a time, then the score.
export function LessonPlayer({ lessonRef, settings, onFinish, onQuit, onNext }: Props): JSX.Element {
  const { lesson } = lessonRef
  const [seed, setSeed] = useState(() => Date.now())
  const [phase, setPhase] = useState<Phase>("intro")
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [feedback, setFeedback] = useState<boolean>()
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const exercises = useMemo(
    () => generateLesson(lesson, lessonContext(lessonRef), settings.exerciseCount, seed),
    [lesson, seed],
  )
  const timing = scaleTiming(lessonTiming(lessonRef), SPEED_FACTOR[settings.speed])

  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    player.stop()
  }, [])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }

  const start = () => {
    player.ensure()
    setIndex(0)
    setResults([])
    setFeedback(undefined)
    setPhase("exercises")
  }

  const answer = (correct: boolean) => {
    if (feedback != undefined) {
      return
    }
    player.stop()
    player.chime(correct)
    setFeedback(correct)
    setResults(r => [...r, correct])
    if (correct) {
      later(advance, ADVANCE_DELAY)
    }
  }

  const advance = () => {
    setLeaving(true)
    later(() => {
      setLeaving(false)
      setFeedback(undefined)
      setIndex(index + 1)
      if (index + 1 >= exercises.length) {
        setPhase("result")
      }
    }, SLIDE_OUT)
  }

  // the score goes in once, as the result appears
  const score = results.length == 0 ? 0 : results.filter(r => r).length / exercises.length
  useEffect(() => {
    if (phase == "result") {
      onFinish(score)
    }
  }, [phase])

  const retry = () => {
    timers.current.forEach(clearTimeout)
    setSeed(s => s + 1)
    start()
  }

  if (phase == "intro") {
    return <LessonIntro lessonRef={lessonRef} timing={timing} onStart={start} onQuit={onQuit} />
  }
  if (phase == "result") {
    return (
      <LessonResult
        score={score}
        isTest={lessonRef.isTest}
        title={lesson.title}
        onRetry={retry}
        onNext={onNext}
        onBack={onQuit}
      />
    )
  }

  const exercise = exercises[index]
  const done = index + (feedback != undefined ? 1 : 0)

  return (
    <div className="lessonPlayer">
      <header className="lessonTop">
        <button type="button" className="iconButton" onClick={onQuit} aria-label="Leave the lesson">
          <CloseIcon />
        </button>
        <div className="progressBar" role="progressbar" aria-valuemin={0} aria-valuemax={exercises.length} aria-valuenow={done}>
          <div className="progressFill" style={{ width: `${(done / exercises.length) * 100}%` }} />
        </div>
      </header>

      <div className="exerciseViewport">
        {exercise && (
          <div key={`${seed}-${index}`} className={`exerciseSlide${leaving ? " leaving" : ""}`}>
            <ExerciseView
              exercise={exercise}
              timing={timing}
              keyUnitMs={1200 / settings.keyWpm}
              locked={feedback != undefined}
              onAnswer={answer}
            />
          </div>
        )}
      </div>

      {feedback != undefined && exercise && (
        <FeedbackBar correct={feedback} exercise={exercise} onContinue={advance} />
      )}
    </div>
  )
}

function ExerciseView(props: ExerciseProps): JSX.Element {
  const kind: ExerciseKind = props.exercise.kind
  switch (kind) {
    case "listenReadTiles": return <ListenExercise {...props} showCode answer="tiles" />
    case "listenReadText": return <ListenExercise {...props} showCode answer="text" />
    case "listenTiles": return <ListenExercise {...props} showCode={false} answer="tiles" />
    case "listenText": return <ListenExercise {...props} showCode={false} answer="text" />
    case "writeTiles": return <WriteTilesExercise {...props} />
    case "tap": return <TapExercise {...props} />
  }
}

function FeedbackBar({ correct, exercise, onContinue }: { correct: boolean, exercise: Exercise, onContinue: () => void }): JSX.Element {
  const continueRef = useRef<HTMLButtonElement>(null)
  useEffect(() => continueRef.current?.focus(), [])
  const { text, meaning } = exercise.item
  return (
    <div className={`feedbackBar ${correct ? "correct" : "wrong"}`} role="status">
      <div className="feedbackInner">
        <div className="feedbackText">
          <strong>{correct ? pick(PRAISE, text) : "Not quite"}</strong>
          {!correct && (
            <div className="feedbackAnswer">
              <span>The answer was <b>{displayText(text)}</b></span>
              <MorseCode text={text} size="small" />
            </div>
          )}
          {meaning && <div className="feedbackMeaning">{displayText(text)} means “{meaning}”</div>}
        </div>
        {!correct && (
          <button ref={continueRef} type="button" className="primary" onClick={onContinue}>Continue</button>
        )}
      </div>
    </div>
  )
}

const PRAISE = ["Nice!", "Correct!", "Great!", "Spot on!", "Well done!", "Yes!"]

function pick(list: string[], key: string): string {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return list[(h + Math.floor(Date.now() / 1000)) % list.length]
}

function LessonIntro({ lessonRef, timing, onStart, onQuit }: {
  lessonRef: LessonRef, timing: Timing, onStart: () => void, onQuit: () => void,
}): JSX.Element {
  const { lesson, isTest, chapter, lessonIndex } = lessonRef
  const [playing, setPlaying] = useState<string>()
  const [playState, setPlayState] = useState<PlayState>()
  useEffect(() => () => player.stop(), [])

  const play = (text: string) => {
    setPlaying(text)
    player.play(text, timing, setPlayState).then(() => setPlaying(p => p == text ? undefined : p))
  }

  // the new items to meet before starting (a test has nothing new)
  const items = isTest ? [] : lesson.newItems
  return (
    <div className="lessonIntro">
      <header className="lessonTop">
        <button type="button" className="iconButton" onClick={onQuit} aria-label="Back to the chapter">
          <CloseIcon />
        </button>
      </header>
      <div className="lessonIntroBody">
        <p className="eyebrow">{chapter.title} · {isTest ? "Test" : `Lesson ${lessonIndex + 1}`}</p>
        <h1>{lesson.title}</h1>
        {lesson.intro && <p className="lessonIntroText">{lesson.intro}</p>}

        {items.length > 0 && (
          <ul className="introItems">
            {items.map(item => (
              // a phrase or a long word gets a whole row, so its code isn't squeezed
              <li key={item.text} className={/ /.test(item.text.trim()) || displayText(item.text).length > 6 ? "wide" : undefined}>
                <button type="button" className={`introItem${playing == item.text ? " playing" : ""}`} onClick={() => play(item.text)}>
                  <span className="introItemText">{displayText(item.text)}</span>
                  <MorseCode text={item.text} size="small" playState={playing == item.text ? playState : undefined} />
                  {item.meaning && <span className="introItemMeaning">{item.meaning}</span>}
                  <span className="introItemPlay"><SpeakerIcon /></span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && <p className="hintText">Tap each one to hear it.</p>}
      </div>
      <div className="lessonIntroFooter">
        <button type="button" className="primary big" onClick={onStart}>
          {isTest ? "Start the test" : "Start"}
        </button>
      </div>
    </div>
  )
}

export function CloseIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
