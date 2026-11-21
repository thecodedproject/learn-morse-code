import { letters, phrases, words } from "./helpers"
import { ChapterDef, TEST_INTRO, TEST_LENGTH } from "./types"

// Numbers, which follow a pattern that makes them easy, and the punctuation that turns
// up most.
export const chapter5: ChapterDef = {
  id: "c5",
  title: "Numbers & Punctuation",
  description: "0 to 9, then . , ? / = and @",
  speed: { charWpm: 18, effWpm: 9 },
  lessons: [
    {
      id: "c5l1",
      title: "1 to 5",
      intro: "Every digit is five elements long. 1 to 5 start with dots: count them. "
        + "1 is one dot then dashes; 5 is five dots.",
      newItems: letters("12345"),
      reviewItems: letters("EISH"),
      difficulty: 2,
    },
    {
      id: "c5l2",
      title: "6 to 0",
      intro: "6 to 0 start with dashes: 6 is one dash then dots, 9 is four dashes then a dot, "
        + "and 0 is five dashes.",
      newItems: letters("67890"),
      reviewItems: letters("12345"),
      difficulty: 2,
    },
    {
      id: "c5l3",
      title: "All ten digits",
      intro: "Watch out for 5 and H, which differ by one dot.",
      newItems: letters("1234567890"),
      reviewItems: letters("HSBO"),
      difficulty: 3,
    },
    {
      id: "c5l4",
      title: "Numbers",
      newItems: words("10 12 25 42 99 100 365 1844 2026"),
      reviewItems: letters("1234567890"),
      difficulty: 3,
    },
    {
      id: "c5l5",
      title: "Letters and numbers",
      newItems: phrases("AT 9|ROOM 12|5 MILES|7 DAYS|24 HOURS|2 DOGS|1ST PRIZE"),
      reviewItems: words("42 100 365"),
      difficulty: 4,
    },
    {
      id: "c5l6",
      title: "Full stop, comma, question mark",
      intro: "Punctuation codes are six elements long. The question mark is easy to remember: "
        + "dot-dot, dash-dash, dot-dot.",
      newItems: [
        { text: ".", meaning: "full stop" },
        { text: ",", meaning: "comma" },
        { text: "?", meaning: "question mark" },
      ],
      reviewItems: letters("SOHR"),
      difficulty: 3,
    },
    {
      id: "c5l7",
      title: "Slash, equals and @",
      intro: "The @ sign is the newest code of all, added in 2004 for email addresses.",
      newItems: [
        { text: "/", meaning: "slash" },
        { text: "=", meaning: "equals, also used as a break between parts of a message" },
        { text: "@", meaning: "at, as in an email address" },
        { text: "-", meaning: "hyphen" },
      ],
      reviewItems: [{ text: "." }, { text: "," }, { text: "?" }],
      difficulty: 3,
    },
    {
      id: "c5l8",
      title: "Sentences with punctuation",
      intro: "Type the punctuation too: it counts here.",
      newItems: phrases("HOW ARE YOU?|I AM WELL.|YES, PLEASE.|WHERE ARE YOU?|SEE YOU AT 5.|1/2 OF IT"),
      reviewItems: phrases("7 DAYS|ROOM 12"),
      difficulty: 4,
    },
  ],
  test: {
    id: "c5t",
    title: "Chapter test",
    intro: TEST_INTRO,
    newItems: [
      ...letters("1234567890"),
      ...words("42 365 2026"),
      { text: "?" },
      { text: "/" },
      ...phrases("5 MILES|24 HOURS|HOW ARE YOU?|YES, PLEASE."),
    ],
    difficulty: 5,
    exerciseCount: TEST_LENGTH,
  },
}
