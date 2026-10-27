import type { CaseDefinition, CaseWords } from "./engine/types";

/** The agency's usual words for things. A case can replace any of them (`words` in its definition). */
export const DEFAULT_WORDS: CaseWords = {
  photo: "Photo",
  photoAction: "Take a photo",
  photoTaken: "Photographed. It is filed with your evidence.",
  photoNote: "Photographed",
  photoPrefix: "P",
  photoStamp: ["Photo", "Filed"],
  collectedStamp: ["Collected", "Evidence"],
  notebook: "Notebook",
  evidence: "Evidence",
  map: "Map",
  board: "Murder board",
  home: "the office",
  phone: "Telephone",
  callWaiting: "A call is waiting at the office",
  callRinging: "Telephone ringing",
  callNotice: "The line is ringing.",
  callAnswer: "Answer the telephone",
  callDefer: "Let it ring",
  callClose: "Hang up",
  callLog: "Earlier calls",
  byPhone: "By telephone from your office",
  callContact: "Call",
  outgoing: "Make a call",
  boardHintWaiting: "Det. Bennett is trying to reach you at the office.",
  leave: "Return to Agency HQ",
  reviewer: "the agency",
  form: "FORM BI-7",
  observed: "",
  claimed: "",
};

/** The words this case uses: its own where it has them, the agency's otherwise. */
export function wordsFor(def: Pick<CaseDefinition, "words">): CaseWords {
  return { ...DEFAULT_WORDS, ...(def.words ?? {}) };
}
