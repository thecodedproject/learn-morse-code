import { ChapterDef } from "../course/types"
import { Progress } from "../lib/progress"
import { go } from "./use_route"

// ChapterView lists a chapter's lessons and its test, with the best score in each
export function ChapterView({ chapter, index, progress }: { chapter: ChapterDef, index: number, progress: Progress }): JSX.Element {
  const entries = [...chapter.lessons, chapter.test]
  return (
    <div className="chapterView">
      <button type="button" className="backLink" onClick={() => go({ screen: "home" })}>← All chapters</button>
      <p className="eyebrow">Chapter {index + 1}</p>
      <h1>{chapter.title}</h1>
      <p className="chapterViewDescription">{chapter.description}</p>
      <ol className="lessonList">
        {entries.map((lesson, i) => {
          const isTest = i == chapter.lessons.length
          const p = progress.lessons[lesson.id]
          return (
            <li key={lesson.id}>
              <button
                type="button"
                className={`lessonRow${isTest ? " test" : ""}${p?.completed ? " completed" : ""}`}
                onClick={() => go({ screen: "lesson", chapterId: chapter.id, lessonIndex: i })}
              >
                <span className="lessonBadge">{p?.completed ? "✓" : isTest ? "★" : i + 1}</span>
                <span className="lessonInfo">
                  <span className="lessonTitle">{isTest ? "Chapter test" : lesson.title}</span>
                  <span className="lessonSub">
                    {isTest ? "Score 80% to pass" : lesson.newItems.slice(0, 6).map(it => it.text.replace(/[<>]/g, "")).join(" · ")}
                  </span>
                </span>
                {p != undefined && <span className="lessonBest">{Math.round(p.best * 100)}%</span>}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
