import { useEffect, useState } from "react"
import { player } from "../lib/player"
import {
  MAX_EXERCISES, MAX_TONE, MIN_EXERCISES, MIN_TONE, Settings, Speed, SPEEDS, Theme,
} from "../lib/settings"
import { CloseIcon } from "./lesson_player"

interface Props {
  settings: Settings
  theme: Theme
  onChange: (changes: Partial<Settings>) => void
  onTheme: (theme: Theme) => void
  onResetProgress: () => void
  onClose: () => void
}

const SPEED_LABELS: Record<Speed, string> = { slower: "Slower", normal: "Normal", faster: "Faster" }

export function SettingsPanel({ settings, theme, onChange, onTheme, onResetProgress, onClose }: Props): JSX.Element {
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key == "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const sample = () => player.play("E T", { charWpm: 18, effWpm: 10 })

  return (
    <div className="sheetBackdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Settings" onClick={e => e.stopPropagation()}>
        <header className="sheetHeader">
          <h2>Settings</h2>
          <button type="button" className="iconButton" onClick={onClose} aria-label="Close settings"><CloseIcon /></button>
        </header>

        <section className="setting">
          <span className="settingLabel">Listening speed</span>
          <div className="segmented">
            {SPEEDS.map(s => (
              <button key={s} type="button" className={settings.speed == s ? "selected" : ""} onClick={() => onChange({ speed: s })}>
                {SPEED_LABELS[s]}
              </button>
            ))}
          </div>
        </section>

        <section className="setting">
          <label className="settingLabel" htmlFor="tone">Tone pitch <span className="settingValue">{settings.toneHz} Hz</span></label>
          <input
            id="tone" type="range" min={MIN_TONE} max={MAX_TONE} step={10} value={settings.toneHz}
            onChange={e => onChange({ toneHz: Number(e.target.value) })}
            onPointerUp={sample} onKeyUp={sample}
          />
        </section>

        <section className="setting">
          <label className="settingLabel" htmlFor="volume">Volume <span className="settingValue">{Math.round(settings.volume * 100)}%</span></label>
          <input
            id="volume" type="range" min={0} max={1} step={0.05} value={settings.volume}
            onChange={e => onChange({ volume: Number(e.target.value) })}
            onPointerUp={sample} onKeyUp={sample}
          />
        </section>

        <section className="setting">
          <label className="settingLabel" htmlFor="count">Exercises per lesson <span className="settingValue">{settings.exerciseCount}</span></label>
          <input
            id="count" type="range" min={MIN_EXERCISES} max={MAX_EXERCISES} step={1} value={settings.exerciseCount}
            onChange={e => onChange({ exerciseCount: Number(e.target.value) })}
          />
        </section>

        <section className="setting">
          <label className="settingLabel" htmlFor="key">Tapping speed <span className="settingValue">{settings.keyWpm} wpm</span></label>
          <input
            id="key" type="range" min={4} max={25} step={1} value={settings.keyWpm}
            onChange={e => onChange({ keyWpm: Number(e.target.value) })}
          />
          <span className="settingHelp">How fast you tap. Lower it if your dots are read as dashes.</span>
        </section>

        <section className="setting">
          <span className="settingLabel">Theme</span>
          <div className="segmented">
            {(["light", "dark"] as Theme[]).map(t => (
              <button key={t} type="button" className={theme == t ? "selected" : ""} onClick={() => onTheme(t)}>
                {t == "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </section>

        <section className="setting">
          <button
            type="button"
            className={`danger${confirmReset ? " confirming" : ""}`}
            onClick={() => {
              if (confirmReset) {
                onResetProgress()
                setConfirmReset(false)
              } else {
                setConfirmReset(true)
              }
            }}
            onBlur={() => setConfirmReset(false)}
          >
            {confirmReset ? "Tap again to wipe all progress" : "Reset progress"}
          </button>
        </section>
      </div>
    </div>
  )
}
