// Playing Morse out loud. Each dot and dash is a burst of a steady tone, scheduled
// ahead on the audio clock so the rhythm stays exact however busy the page is, and
// the element being heard is reported as it sounds so the code on screen can follow.
//
// The same tone sounds while the learner holds the key down, and there are short
// chimes for right and wrong answers.

import { buildTimeline, Timing } from "./timing"

// which element is being heard: the index into the timeline's elements of the latest
// one started, and whether it is still sounding (or it's the gap after it)
export interface PlayState {
  index: number
  sounding: boolean
}

const RAMP = 0.005 // seconds to fade each element in and out, so it doesn't click
const LEAD_IN = 0.08

export class MorsePlayer {
  private ctx?: AudioContext
  private output?: GainNode
  private toneHz = 600
  private volume = 0.7

  private frame?: number
  private finish?: () => void
  private keyTone?: { osc: OscillatorNode, gain: GainNode }
  // set when the audio may have been cut off, by the app going into the background or
  // by iOS taking the audio away (a phone call, say)
  private interrupted = false

  constructor() {
    if (typeof window == "undefined") {
      return
    }
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState == "hidden") {
        this.interrupted = true
        this.stop()
      } else {
        this.ctx?.resume().catch(() => undefined)
      }
    })
    window.addEventListener("pageshow", () => this.ctx?.resume().catch(() => undefined))
    // these run before any button's own handler, so a tap on Play finds the audio
    // already back
    for (const type of ["pointerdown", "touchend", "click", "keydown"]) {
      window.addEventListener(type, () => this.revive(), { capture: true })
    }
  }

  // revive brings back audio that was cut off. iOS can leave the old context suspended
  // (or "interrupted") however often it's asked to resume, so inside a tap, which is
  // when a browser allows new audio, it's swapped for a fresh one.
  private revive() {
    const ctx = this.ctx
    if (ctx == undefined || !this.interrupted) {
      return
    }
    if (ctx.state == "running") {
      this.interrupted = false
      return
    }
    this.stop()
    this.output?.disconnect()
    ctx.close().catch(() => undefined)
    this.ctx = undefined
    this.interrupted = false
    this.ensure()
  }

  setTone(hz: number) {
    this.toneHz = hz
  }

  setVolume(volume: number) {
    this.volume = volume
    if (this.output != undefined) {
      this.output.gain.value = volume
    }
  }

  // ensure gets the audio going. Browsers (iOS Safari especially) only let audio start
  // from a tap or click, so this is called from one before anything is played.
  ensure(): AudioContext {
    if (this.ctx == undefined) {
      const Context = typeof AudioContext != "undefined"
        ? AudioContext : (window as any).webkitAudioContext
      if (Context == undefined) {
        throw new Error("this browser cannot play audio")
      }
      const ctx = new Context() as AudioContext
      ctx.onstatechange = () => {
        if (ctx.state != "running") {
          this.interrupted = true
        }
      }
      this.ctx = ctx
      this.newOutput()
    }
    // iOS stays silent with the ringer switched off unless told this is playback
    const session = (navigator as any).audioSession
    if (session != undefined) {
      try { session.type = "playback" } catch { /* older browsers */ }
    }
    if (this.ctx.state != "running") {
      this.ctx.resume().catch(() => undefined)
    }
    return this.ctx
  }

  // play sends text (or words of letter codes), reporting each element as it's heard and undefined once done.
  // The promise resolves when it has finished or been stopped.
  play(text: string | string[][], timing: Timing, onState?: (state: PlayState | undefined) => void): Promise<void> {
    this.stop()
    const ctx = this.ensure()
    const timeline = buildTimeline(text, timing)
    const start = ctx.currentTime + LEAD_IN
    for (const el of timeline.elements) {
      this.beep(start + el.start, el.duration)
    }
    // if the audio clock stalls (the audio was cut off and hasn't come back), playing
    // still ends, going by the wall clock, so nothing waits on it for ever
    const deadline = performance.now() + (LEAD_IN + timeline.duration) * 1000 + 1500
    return new Promise(resolve => {
      let last: PlayState | undefined
      const done = () => {
        if (this.frame != undefined) {
          cancelAnimationFrame(this.frame)
          this.frame = undefined
        }
        this.finish = undefined
        onState?.(undefined)
        resolve()
      }
      this.finish = done
      const track = () => {
        const t = ctx.currentTime - start
        if (t > timeline.duration + 0.05 || performance.now() > deadline) {
          done()
          return
        }
        let index = -1
        for (let i = 0; i < timeline.elements.length && timeline.elements[i].start <= t; i++) {
          index = i
        }
        const el = timeline.elements[index]
        const state = { index, sounding: el != undefined && t < el.start + el.duration }
        if (last == undefined || last.index != state.index || last.sounding != state.sounding) {
          last = state
          onState?.(state)
        }
        this.frame = requestAnimationFrame(track)
      }
      this.frame = requestAnimationFrame(track)
    })
  }

  // stop cuts off anything playing
  stop() {
    if (this.ctx != undefined) {
      this.output?.disconnect()
      this.newOutput()
    }
    this.keyTone?.osc.stop()
    this.keyTone = undefined
    this.finish?.()
  }

  keyDown() {
    const ctx = this.ensure()
    if (this.keyTone != undefined) {
      return
    }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = this.toneHz
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + RAMP)
    osc.connect(gain).connect(this.output!)
    osc.start()
    this.keyTone = { osc, gain }
  }

  keyUp() {
    const tone = this.keyTone
    if (tone == undefined || this.ctx == undefined) {
      return
    }
    const now = this.ctx.currentTime
    tone.gain.gain.cancelScheduledValues(now)
    tone.gain.gain.setValueAtTime(tone.gain.gain.value, now)
    tone.gain.gain.linearRampToValueAtTime(0, now + RAMP)
    tone.osc.stop(now + RAMP + 0.01)
    this.keyTone = undefined
  }

  // chime is a rising pair of notes for a right answer, a low buzz for a wrong one
  chime(correct: boolean) {
    if (this.ctx == undefined) {
      return
    }
    const ctx = this.ctx
    const now = ctx.currentTime + 0.01
    const notes = correct ? [[880, 0], [1320, 0.09]] : [[220, 0], [196, 0.14]]
    for (const [hz, at] of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = correct ? "sine" : "triangle"
      osc.frequency.value = hz
      gain.gain.setValueAtTime(0, now + at)
      gain.gain.linearRampToValueAtTime(0.25, now + at + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + at + 0.25)
      osc.connect(gain).connect(this.output!)
      osc.start(now + at)
      osc.stop(now + at + 0.3)
    }
  }

  private newOutput() {
    const ctx = this.ctx!
    this.output = ctx.createGain()
    this.output.gain.value = this.volume
    this.output.connect(ctx.destination)
  }

  private beep(at: number, duration: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = this.toneHz
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(0.5, at + RAMP)
    gain.gain.setValueAtTime(0.5, at + duration - RAMP)
    gain.gain.linearRampToValueAtTime(0, at + duration)
    osc.connect(gain).connect(this.output!)
    osc.start(at)
    osc.stop(at + duration + 0.01)
  }
}

// one player for the whole app, so there's only ever one thing sounding
export const player = new MorsePlayer()
