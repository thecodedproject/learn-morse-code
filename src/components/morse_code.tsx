import { encode } from "../lib/morse"
import { PlayState } from "../lib/player"
import "./morse_code.css"

interface Props {
  text: string
  // when given, the element being heard lights up and those already heard stay lit
  playState?: PlayState
  size?: "small" | "large"
}

// MorseCode draws text's code as dots and dashes, a letter to a group and words
// split by a slash
export function MorseCode({ text, playState, size = "large" }: Props): JSX.Element {
  let n = 0
  const words = encode(text)
  return (
    <span className={`morse morse-${size}`} aria-label={describe(words)} role="img">
      {words.map((word, w) => (
        <span key={w} className="morseWordWrap">
          {w > 0 && <span className="morseSlash" aria-hidden="true">/</span>}
          <span className="morseWord">
            {word.map((code, l) => (
              <span key={l} className="morseLetter">
                {code.split("").map((kind, i) => {
                  const index = n++
                  let state = ""
                  if (playState != undefined) {
                    if (index == playState.index && playState.sounding) {
                      state = " active"
                    } else if (index <= playState.index) {
                      state = " heard"
                    }
                  }
                  return (
                    <span key={i} className={`morseEl ${kind == "." ? "dot" : "dash"}${state}`} />
                  )
                })}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

// MorseGlyphs draws a single code, written as dots and dashes, e.g. on a tile
export function MorseGlyphs({ code }: { code: string }): JSX.Element {
  return (
    <span className="morse morse-small" aria-label={code.replace(/\./g, "dot ").replace(/-/g, "dash ")} role="img">
      {code.split(" ").map((letter, l) => (
        <span key={l} className="morseLetter">
          {letter.split("").map((kind, i) => (
            <span key={i} className={`morseEl ${kind == "." ? "dot" : "dash"}`} />
          ))}
        </span>
      ))}
    </span>
  )
}

function describe(words: string[][]): string {
  return words
    .map(w => w.map(c => c.replace(/\./g, "dot ").replace(/-/g, "dash ").trim()).join(", "))
    .join(" / ")
}
