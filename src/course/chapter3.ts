import { letters, words } from "./helpers"
import { ChapterDef, TEST_INTRO, TEST_LENGTH } from "./types"

// The rest of the alphabet: the less common letters, all four elements long.
export const chapter3: ChapterDef = {
  id: "c3",
  title: "The Rest of the Alphabet",
  description: "F P B V C Y J Q X Z, and the radio operator's shorthand",
  speed: { charWpm: 18, effWpm: 7 },
  lessons: [
    {
      id: "c3l1",
      title: "F and P",
      intro: "F is dot-dot-dash-dot; P is dot-dash-dash-dot.",
      newItems: letters("FP"),
      reviewItems: letters("RDUKGWHL"),
      difficulty: 2,
    },
    {
      id: "c3l2",
      title: "B and V",
      intro: "B is dash then three dots; V is three dots then a dash.",
      newItems: letters("BV"),
      reviewItems: letters("FPHSU"),
      difficulty: 2,
    },
    {
      id: "c3l3",
      title: "C and Y",
      intro: "C is dash-dot-dash-dot; Y is dash-dot-dash-dash.",
      newItems: letters("CY"),
      reviewItems: letters("FPBVK"),
      difficulty: 3,
    },
    {
      id: "c3l4",
      title: "J and Q",
      intro: "J is a dot then three dashes; Q is dash-dash-dot-dash.",
      newItems: letters("JQ"),
      reviewItems: letters("CYWG"),
      difficulty: 3,
    },
    {
      id: "c3l5",
      title: "X and Z",
      intro: "X is dash-dot-dot-dash; Z is dash-dash-dot-dot.",
      newItems: letters("XZ"),
      reviewItems: letters("JQDG"),
      difficulty: 3,
    },
    {
      id: "c3l6",
      title: "The whole alphabet",
      intro: "All 26 letters. Take your time.",
      newItems: letters("FPBVCYJQXZ"),
      reviewItems: letters("ETAINMSORDUKGWHL"),
      difficulty: 4,
    },
    {
      id: "c3l7",
      title: "Words with new letters",
      newItems: words("FOX BOX ZOO JAZZ QUIZ JUMP CITY VERY COPY FIVE BUZZ"),
      reviewItems: words("HELLO WORLD GOOD"),
      difficulty: 4,
    },
    {
      id: "c3l8",
      title: "Radio shorthand",
      intro: "Radio operators shorten common words to save time. These aren't English words, "
        + "but you'll hear them on the air.",
      newItems: [
        { text: "CQ", meaning: "calling anyone" },
        { text: "DE", meaning: "from (this is…)" },
        { text: "TNX", meaning: "thanks" },
        { text: "PSE", meaning: "please" },
        { text: "CU", meaning: "see you" },
        { text: "FB", meaning: "fine business: great!" },
        { text: "GM", meaning: "good morning" },
        { text: "GN", meaning: "good night" },
        { text: "OM", meaning: "old man: friend" },
      ],
      reviewItems: words("QUIZ FOX JAZZ"),
      difficulty: 4,
    },
  ],
  test: {
    id: "c3t",
    title: "Chapter test",
    intro: TEST_INTRO,
    newItems: [
      ...letters("FPBVCYJQXZ"),
      ...words("FOX QUIZ JAZZ CITY"),
      { text: "CQ" },
      { text: "TNX" },
    ],
    difficulty: 5,
    exerciseCount: TEST_LENGTH,
  },
}
