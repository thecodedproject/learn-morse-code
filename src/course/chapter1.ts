import { letters, phrases, words } from "./helpers"
import { ChapterDef, TEST_INTRO, TEST_LENGTH } from "./types"

// The eight letters with the shortest codes, which happen to be among the commonest
// in English too: enough to make plenty of words.
export const chapter1: ChapterDef = {
  id: "c1",
  title: "First Letters",
  description: "E T A I N M S O: the shortest codes, and your first words",
  speed: { charWpm: 15, effWpm: 5 },
  lessons: [
    {
      id: "c1l1",
      title: "E and T",
      intro: "The two shortest codes of all: E is a single dot, T a single dash.",
      newItems: letters("ET"),
      difficulty: 1,
    },
    {
      id: "c1l2",
      title: "A and N",
      intro: "A and N are mirror images: dot-dash and dash-dot.",
      newItems: letters("AN"),
      reviewItems: letters("ET"),
      difficulty: 1,
    },
    {
      id: "c1l3",
      title: "I and M",
      intro: "Two dots make I; two dashes make M.",
      newItems: letters("IM"),
      reviewItems: letters("ETAN"),
      difficulty: 1,
    },
    {
      id: "c1l4",
      title: "S and O",
      intro: "Three dots for S, three dashes for O. Put them together and you have SOS.",
      newItems: letters("SO"),
      reviewItems: letters("ETANIM"),
      difficulty: 2,
    },
    {
      id: "c1l5",
      title: "All eight letters",
      intro: "A mix of everything so far.",
      newItems: letters("ETAINMSO"),
      difficulty: 2,
    },
    {
      id: "c1l6",
      title: "First words",
      intro: "Letters make words. Listen for the longer gaps between letters.",
      newItems: words("IT AT ON IN NO AN ME SO TO AM AS IS"),
      reviewItems: letters("ETAINMSO"),
      difficulty: 3,
    },
    {
      id: "c1l7",
      title: "Longer words",
      newItems: words("TEA EAT SAT MAN TEN SET NOT MAT SEA TIME NOTE MOST"),
      reviewItems: words("IT ON IN NO ME SO"),
      difficulty: 3,
    },
    {
      id: "c1l8",
      title: "SOS and short phrases",
      intro: "SOS is sent as one run-together signal, ...---..., with no gaps between its letters. "
        + "Words in a phrase have a longer gap between them. A touch faster this time.",
      newItems: [
        { text: "<SOS>", meaning: "the distress signal, sent without gaps" },
        ...phrases("I AM|IT IS|NOT ME|NO TEA|ON TIME"),
      ],
      reviewItems: words("TEA MAN TEN NOTE"),
      difficulty: 4,
      speed: { effWpm: 6 },
    },
  ],
  test: {
    id: "c1t",
    title: "Chapter test",
    intro: TEST_INTRO,
    newItems: [
      ...letters("ETAINMSO"),
      ...words("IT ON ME TEA MAN NOTE TIME"),
      { text: "<SOS>" },
      ...phrases("I AM|IT IS"),
    ],
    difficulty: 5,
    exerciseCount: TEST_LENGTH,
  },
}
