import { Item } from "./types"

// letters("ET") is the items E and T
export function letters(chars: string): Item[] {
  return chars.split("").map(text => ({ text }))
}

// words("IT AT ON") is the items IT, AT and ON
export function words(list: string): Item[] {
  return list.trim().split(/\s+/).map(text => ({ text }))
}

// phrases("I AM|IT IS") is the items "I AM" and "IT IS"
export function phrases(list: string): Item[] {
  return list.split("|").map(text => ({ text: text.trim() }))
}
