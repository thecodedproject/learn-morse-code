# Dit Dah: learn Morse code

A web app for learning Morse code in short lessons, in the style of a language-learning app.

- **Chapters** cover a broad theme, and each one ends in a **test** that you pass with 80%.
  Everything is open from the start, so you can go to any chapter or lesson.
- **Lessons** take about five minutes. Each one opens by introducing its new letters or
  words, which you can tap to hear, and then has 8 exercises (you can change the number in
  Settings). The exercises get a little harder through each lesson and each chapter:
  - *listen and read*: you hear the code, see it light up as it plays, and pick the answer
    from tiles
  - *listen and read, typed*: the same, but you type the answer
  - *write*: you build the code for some English from tiles of dots and dashes
  - *listen only*: you hear the code without seeing it, and pick tiles or type the answer
  - *tap*: you key the code in yourself, on the big button or with the space bar
- A right answer moves on automatically. A wrong one shows the answer and waits for you to
  continue. The more you get right, the more confetti at the end.
- Listening uses Farnsworth timing: each letter is sent at full speed and the gaps are
  stretched, so letters keep their rhythm. You can make it slower or faster in Settings.
- Progress, settings and the light/dark choice are kept in `localStorage`.

## The course

The course content is in `src/course/`, with one file per chapter. A chapter lists its
lessons, and each lesson gives its new items, any items it reviews, a difficulty from 1 to 5
(which sets the mix of exercises) and, if it needs one, its own speed. `src/lib/lesson_gen.ts`
turns a lesson into exercises and chooses believable wrong tiles. A test in
`lesson_gen.spec.ts` checks that every lesson uses only letters taught by that point.

1. First Letters: E T A I N M S O, first words, and SOS
2. More Letters: R D U K G W H L, with words and short phrases
3. The Rest of the Alphabet: F P B V C Y J Q X Z, and radio shorthand (CQ, TNX, …)

## Building

    yarn install
    yarn test
    yarn start        # builds into dist/ and serves it on http://127.0.0.1:8080
    yarn build:prod   # a minified build

`public/` is copied into `dist/` as it is, as in the metronome. It holds the web app
manifest, the icons, and `sw.js`, a service worker that lets the app open offline once it's
saved to a home screen. Pushing to `main` deploys to GitHub Pages
(`.github/workflows/pages.yml`).
