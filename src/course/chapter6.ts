import { phrases } from "./helpers"
import { ChapterDef, TEST_INTRO, TEST_LENGTH } from "./types"

// How radio operators talk: prosigns, Q-codes, shorthand and callsigns, ending with a
// whole contact from first call to goodbye.
export const chapter6: ChapterDef = {
  id: "c6",
  title: "Radio Talk",
  description: "Prosigns, Q-codes, callsigns, and a whole contact from CQ to 73",
  speed: { charWpm: 20, effWpm: 10 },
  lessons: [
    {
      id: "c6l1",
      title: "Prosigns",
      intro: "Like SOS, these are sent as one run-together signal. They mark the shape of a "
        + "conversation.",
      newItems: [
        { text: "<AR>", meaning: "end of message" },
        { text: "<SK>", meaning: "end of contact: goodbye" },
        { text: "<KN>", meaning: "over, and only you should answer" },
        { text: "<BT>", meaning: "break, a new part of the message (the same code as =)" },
      ],
      reviewItems: [{ text: "<SOS>" }, { text: "K", meaning: "over to you" }],
      difficulty: 3,
    },
    {
      id: "c6l2",
      title: "Numbers on the air",
      newItems: [
        { text: "73", meaning: "best regards" },
        { text: "88", meaning: "love and kisses" },
        { text: "599", meaning: "a signal report: perfectly readable, strong, clean tone" },
        { text: "5NN", meaning: "599 again, with N for 9 to save time" },
      ],
      reviewItems: [{ text: "CQ" }, { text: "DE" }, { text: "TNX" }],
      difficulty: 3,
    },
    {
      id: "c6l3",
      title: "Q-codes",
      intro: "Three-letter codes starting with Q, each a whole sentence. Add ? and they become "
        + "a question. This app is named after QRS.",
      newItems: [
        { text: "QRS", meaning: "please send more slowly" },
        { text: "QRQ", meaning: "please send faster" },
        { text: "QTH", meaning: "my location is…" },
        { text: "QSL", meaning: "I confirm I received you" },
        { text: "QRM", meaning: "there's interference" },
        { text: "QRZ", meaning: "who is calling me?" },
        { text: "QSY", meaning: "let's change frequency" },
      ],
      reviewItems: [{ text: "73" }, { text: "<AR>" }],
      difficulty: 4,
    },
    {
      id: "c6l4",
      title: "More shorthand",
      newItems: [
        { text: "UR", meaning: "your" },
        { text: "RST", meaning: "signal report: readability, strength, tone" },
        { text: "WX", meaning: "weather" },
        { text: "HR", meaning: "here" },
        { text: "ES", meaning: "and" },
        { text: "FER", meaning: "for" },
        { text: "OP", meaning: "operator" },
        { text: "RIG", meaning: "radio" },
      ],
      reviewItems: [{ text: "QTH" }, { text: "PSE" }, { text: "FB" }],
      difficulty: 4,
    },
    {
      id: "c6l5",
      title: "Callsigns",
      intro: "Every station has a callsign, and its start tells you the country.",
      newItems: [
        { text: "W1AW", meaning: "the ARRL's station in Connecticut, USA" },
        { text: "M0ABC", meaning: "M: England" },
        { text: "VK2XYZ", meaning: "VK: Australia" },
        { text: "JA1ZZ", meaning: "JA: Japan" },
        { text: "DL5QR", meaning: "DL: Germany" },
        { text: "VE3KD", meaning: "VE: Canada" },
      ],
      reviewItems: [{ text: "5NN" }, { text: "QRZ" }],
      difficulty: 4,
    },
    {
      id: "c6l6",
      title: "A whole contact",
      intro: "Put together, a contact goes: a call, an answer, a signal report, names and "
        + "places, and goodbye. Slower again, as these are long.",
      newItems: [
        { text: "CQ CQ DE VK2XYZ K", meaning: "calling anyone, this is VK2XYZ, over" },
        { text: "VK2XYZ DE M0ABC K", meaning: "VK2XYZ, this is M0ABC, over" },
        { text: "TNX FER CALL", meaning: "thanks for the call" },
        { text: "UR RST 599", meaning: "your signal report is 599" },
        { text: "QTH LONDON", meaning: "my location is London" },
        { text: "73 <SK>", meaning: "best regards, goodbye" },
      ],
      reviewItems: phrases("NAME JO|WX FB"),
      difficulty: 4,
      speed: { effWpm: 8 },
    },
  ],
  test: {
    id: "c6t",
    title: "Chapter test",
    intro: TEST_INTRO,
    newItems: [
      { text: "<AR>" },
      { text: "<SK>" },
      { text: "73" },
      { text: "5NN" },
      { text: "QRS" },
      { text: "QTH" },
      { text: "QSL" },
      { text: "UR" },
      { text: "WX" },
      { text: "W1AW" },
      ...phrases("TNX FER CALL|UR RST 599|73 <SK>"),
    ],
    difficulty: 5,
    exerciseCount: TEST_LENGTH,
  },
}
