import { phrases, words } from "./helpers"
import { ChapterDef, TEST_INTRO, TEST_LENGTH } from "./types"

// With the whole alphabet learned: the words that come up most, and whole phrases,
// heard a little faster.
export const chapter4: ChapterDef = {
  id: "c4",
  title: "Words & Phrases",
  description: "The commonest words, greetings, and whole sentences at a quicker pace",
  speed: { charWpm: 18, effWpm: 8 },
  lessons: [
    {
      id: "c4l1",
      title: "The commonest words",
      intro: "A handful of words make up a big share of everything written. Learn their sound "
        + "as a whole, not letter by letter.",
      newItems: words("THE AND OF TO IN IS IT YOU THAT WAS FOR ARE"),
      reviewItems: words("HELLO WORLD GOOD"),
      difficulty: 3,
    },
    {
      id: "c4l2",
      title: "More common words",
      newItems: words("WITH HAVE THIS FROM THEY WILL ONE ALL WERE WHAT WHEN YOUR"),
      reviewItems: words("THE AND YOU THAT"),
      difficulty: 3,
    },
    {
      id: "c4l3",
      title: "Greetings",
      intro: "Phrases now: listen for the longer gap between words.",
      newItems: phrases("HI THERE|GOOD MORNING|GOOD NIGHT|THANK YOU|SEE YOU|HOW ARE YOU"),
      reviewItems: words("HELLO YOU ARE GOOD"),
      difficulty: 3,
    },
    {
      id: "c4l4",
      title: "Short sentences",
      newItems: phrases("I AM FINE|IT IS COLD|ALL IS WELL|WHAT TIME IS IT|THE SUN IS OUT|SEE YOU SOON"),
      reviewItems: phrases("THANK YOU|GOOD MORNING"),
      difficulty: 4,
    },
    {
      id: "c4l5",
      title: "Picking up speed",
      intro: "The same words with less space around them. Try to hear each word whole.",
      newItems: words("THE AND YOU THAT WITH HAVE THIS FROM WHAT WHEN"),
      reviewItems: phrases("ALL IS WELL|SEE YOU"),
      difficulty: 4,
      speed: { effWpm: 11 },
    },
    {
      id: "c4l6",
      title: "Longer words",
      newItems: words("RADIO SIGNAL WEATHER FRIEND MESSAGE QUESTION ANSWER QUICKLY"),
      reviewItems: words("WORLD GREAT JUMP"),
      difficulty: 4,
    },
    {
      id: "c4l7",
      title: "Famous messages",
      intro: "Some messages that made history.",
      newItems: [
        { text: "WHAT HATH GOD WROUGHT", meaning: "the first long-distance telegram, from Samuel Morse in 1844" },
        { text: "CQD", meaning: "the distress call before SOS; the Titanic sent both" },
        { text: "COME AT ONCE", meaning: "how distress messages often began" },
        { text: "WE ARE SINKING", meaning: "a message no one wants to send" },
      ],
      reviewItems: [{ text: "<SOS>" }, ...phrases("THANK YOU|ALL IS WELL")],
      difficulty: 4,
      speed: { effWpm: 7 },
    },
  ],
  test: {
    id: "c4t",
    title: "Chapter test",
    intro: TEST_INTRO,
    newItems: [
      ...words("THE AND WITH WHAT FROM RADIO FRIEND QUESTION"),
      ...phrases("GOOD MORNING|THANK YOU|HOW ARE YOU|IT IS COLD|ALL IS WELL|COME AT ONCE"),
      { text: "CQD" },
    ],
    difficulty: 5,
    exerciseCount: TEST_LENGTH,
  },
}
