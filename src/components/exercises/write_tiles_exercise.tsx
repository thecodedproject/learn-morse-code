import { useEffect, useState } from "react"
import { Tile } from "../../lib/lesson_gen"
import { displayText } from "../../lib/morse"
import { player } from "../../lib/player"
import { MorseGlyphs } from "../morse_code"
import { TilePicker } from "../tile_picker"
import { ExerciseProps, tilesCorrect } from "./types"

// WriteTilesExercise shows some English and the learner builds its code from tiles of
// dots and dashes. Each tile plays its sound as it goes into the answer.
export function WriteTilesExercise({ exercise, timing, locked, onAnswer }: ExerciseProps): JSX.Element {
  const [placed, setPlaced] = useState<string[]>([])
  useEffect(() => () => player.stop(), [])

  const onPlace = (tile: Tile) => {
    player.play([tile.label.split(" ")], timing)
  }

  const isPhrase = exercise.answer.some(a => a.includes(" "))

  return (
    <form className="exercise" onSubmit={e => {
      e.preventDefault()
      if (!locked) onAnswer(tilesCorrect(exercise, placed))
    }}>
      <h2 className="exercisePrompt">Build the code for</h2>
      <div className="englishCard">{displayText(exercise.item.text)}</div>

      <div className="exerciseAnswer">
        <TilePicker
          tiles={exercise.tiles}
          placed={placed}
          onChange={setPlaced}
          onPlace={onPlace}
          disabled={locked}
          wide={isPhrase}
          renderLabel={tile => <MorseGlyphs code={tile.label} />}
        />
      </div>

      <div className="exerciseFooter">
        <button type="submit" className="primary" disabled={placed.length == 0 || locked}>Check</button>
      </div>
    </form>
  )
}
