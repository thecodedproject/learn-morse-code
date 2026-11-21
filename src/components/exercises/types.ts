import { Exercise } from "../../lib/lesson_gen"
import { Timing } from "../../lib/timing"

export interface ExerciseProps {
  exercise: Exercise
  timing: Timing
  keyUnitMs: number // the dot length expected when tapping
  locked: boolean // answered: no more changes
  onAnswer: (correct: boolean) => void
}

// tilesCorrect: the tiles placed spell out the answer exactly
export function tilesCorrect(exercise: Exercise, placed: string[]): boolean {
  const labels = placed.map(id => exercise.tiles.find(t => t.id == id)!.label)
  return labels.length == exercise.answer.length && labels.every((l, i) => l == exercise.answer[i])
}
