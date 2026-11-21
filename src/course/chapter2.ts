import { letters, phrases, words } from "./helpers"
import { ChapterDef } from "./types"

const CH1 = "ETAINMSO"

// Eight more letters, all three or four elements long.
export const chapter2: ChapterDef = {
  id: "c2",
  title: "More Letters",
  description: "R D U K G W H L, and words like HELLO and WORLD",
  speed: { charWpm: 16, effWpm: 6 },
  lessons: [
    {
      id: "c2l1",
      title: "R and D",
      intro: "R is dot-dash-dot; D is dash-dot-dot.",
      newItems: letters("RD"),
      reviewItems: letters(CH1),
      difficulty: 2,
    },
    {
      id: "c2l2",
      title: "U and K",
      intro: "U is dot-dot-dash; K is dash-dot-dash. On the radio, K on its own means \"over to you\".",
      newItems: [{ text: "U" }, { text: "K", meaning: "on the radio: \"over to you\"" }],
      reviewItems: letters("RD" + CH1),
      difficulty: 2,
    },
    {
      id: "c2l3",
      title: "G and W",
      intro: "G is dash-dash-dot; W is dot-dash-dash.",
      newItems: letters("GW"),
      reviewItems: letters("RDUK"),
      difficulty: 2,
    },
    {
      id: "c2l4",
      title: "H and L",
      intro: "H is four dots, one more than S. L is dot-dash-dot-dot.",
      newItems: letters("HL"),
      reviewItems: letters("SRDUKGW"),
      difficulty: 3,
    },
    {
      id: "c2l5",
      title: "Sixteen letters",
      intro: "Every letter so far, mixed together.",
      newItems: letters("RDUKGWHL"),
      reviewItems: letters(CH1),
      difficulty: 3,
    },
    {
      id: "c2l6",
      title: "New words",
      newItems: words("RED HOT DOG RUN LOW HAT WORK GOLD WIND HELLO WORLD GREAT"),
      reviewItems: letters("RDUKGWHL"),
      difficulty: 3,
    },
    {
      id: "c2l7",
      title: "Picking up speed",
      intro: "The same sort of words, with less time between letters.",
      newItems: words("HOLD LATE GOOD WORD HAND ROAD DUST WALK HEAT LIGHT"),
      reviewItems: words("RED DOG HELLO WORLD"),
      difficulty: 4,
      speed: { effWpm: 8 },
    },
    {
      id: "c2l8",
      title: "Short phrases",
      newItems: phrases("HELLO WORLD|GOOD DOG|WELL DONE|HOLD ON|GOOD NIGHT|I AM HERE"),
      reviewItems: words("GREAT GOLD WIND"),
      difficulty: 4,
    },
  ],
  test: {
    id: "c2t",
    title: "Chapter test",
    intro: "Twelve questions on everything in this chapter. Score 80% to pass.",
    newItems: [
      ...letters("RDUKGWHL"),
      ...words("RED HELLO WORLD GOLD GOOD"),
      ...phrases("WELL DONE|HOLD ON"),
    ],
    difficulty: 5,
    exerciseCount: 12,
  },
}
