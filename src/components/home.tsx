import { CHAPTERS } from "../course"
import { Progress } from "../lib/progress"
import { go } from "./use_route"

// Home lists the chapters, each with how far through it the learner is. All of them
// are open, whatever has been done.
export function Home({ progress }: { progress: Progress }): JSX.Element {
  return (
    <div className="home">
      <div className="homeHero">
        <h1>Learn Morse code</h1>
        <p>Short lessons, a few minutes each. Listen, read, and tap your way from your first dot to whole words.</p>
      </div>
      <ol className="chapterList">
        {CHAPTERS.map((chapter, i) => {
          const done = chapter.lessons.filter(l => progress.lessons[l.id]?.completed).length
          const passed = progress.lessons[chapter.test.id]?.completed ?? false
          const fraction = (done + (passed ? 1 : 0)) / (chapter.lessons.length + 1)
          return (
            <li key={chapter.id}>
              <button type="button" className="chapterCard" onClick={() => go({ screen: "chapter", chapterId: chapter.id })}>
                <span className="chapterNumber">{i + 1}</span>
                <span className="chapterInfo">
                  <span className="chapterTitle">{chapter.title}</span>
                  <span className="chapterDescription">{chapter.description}</span>
                  <span className="chapterProgress">
                    <span className="miniBar"><span style={{ width: `${fraction * 100}%` }} /></span>
                    <span className="chapterProgressText">
                      {passed ? "Test passed ✓" : `${done} of ${chapter.lessons.length} lessons`}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="moreSoon">More chapters coming soon: words &amp; phrases, numbers, and radio talk.</p>
    </div>
  )
}
