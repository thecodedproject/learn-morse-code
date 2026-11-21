import { LessonContext } from "../lib/lesson_gen"
import { tokenize } from "../lib/morse"
import { Timing } from "../lib/timing"
import { chapter1 } from "./chapter1"
import { chapter2 } from "./chapter2"
import { chapter3 } from "./chapter3"
import { ChapterDef, LessonDef } from "./types"

export const CHAPTERS: ChapterDef[] = [chapter1, chapter2, chapter3]

// a lesson's place in the course; the test is the lesson after the last
export interface LessonRef {
  chapter: ChapterDef
  chapterIndex: number
  lesson: LessonDef
  lessonIndex: number // chapter.lessons.length for the test
  isTest: boolean
}

export function findLesson(chapterId: string, lessonIndex: number): LessonRef | undefined {
  const chapterIndex = CHAPTERS.findIndex(c => c.id == chapterId)
  const chapter = CHAPTERS[chapterIndex]
  if (chapter == undefined || lessonIndex < 0 || lessonIndex > chapter.lessons.length) {
    return undefined
  }
  const isTest = lessonIndex == chapter.lessons.length
  return { chapter, chapterIndex, lesson: isTest ? chapter.test : chapter.lessons[lessonIndex], lessonIndex, isTest }
}

// nextLesson is the one after, running on into the next chapter
export function nextLesson(ref: LessonRef): { chapterId: string, lessonIndex: number } | undefined {
  if (!ref.isTest) {
    return { chapterId: ref.chapter.id, lessonIndex: ref.lessonIndex + 1 }
  }
  const next = CHAPTERS[ref.chapterIndex + 1]
  return next && { chapterId: next.id, lessonIndex: 0 }
}

export function lessonTiming(ref: LessonRef): Timing {
  return { ...ref.chapter.speed, ...ref.lesson.speed }
}

// lessonContext is everything taught up to and including this lesson, from which the
// wrong answers are drawn
export function lessonContext(ref: LessonRef): LessonContext {
  const lessons: LessonDef[] = []
  CHAPTERS.slice(0, ref.chapterIndex).forEach(c => lessons.push(...c.lessons))
  lessons.push(...ref.chapter.lessons.slice(0, ref.lessonIndex + 1))
  const letters = new Set<string>()
  const words = new Set<string>()
  for (const lesson of lessons) {
    for (const item of [...lesson.newItems, ...(lesson.reviewItems ?? [])]) {
      for (const word of tokenize(item.text)) {
        if (word.length == 1) {
          letters.add(word[0])
        } else {
          words.add(word.join(""))
        }
      }
    }
  }
  return { knownLetters: [...letters], knownWords: [...words] }
}
