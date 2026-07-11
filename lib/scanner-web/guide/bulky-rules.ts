/**
 * Bulky item rules for scan guide.
 * Detects items that trigger special handling / fees.
 */

export interface BulkyRule {
  class: string;
  fee: number;
  packingQuestion: string;
}

export const BULKY_RULES: BulkyRule[] = [
  {
    class: "tv",
    fee: 75,
    packingQuestion: "Do you have the original TV box?",
  },
  {
    class: "piano",
    fee: 150,
    packingQuestion: "Does the piano need professional moving?",
  },
  {
    class: "mirror",
    fee: 45,
    packingQuestion: "Is the mirror framed or unframed?",
  },
  {
    class: "art",
    fee: 45,
    packingQuestion: "Is the artwork framed behind glass?",
  },
  {
    class: "plant",
    fee: 25,
    packingQuestion: "Is the plant in a pot larger than 18 inches?",
  },
  {
    class: "safe",
    fee: 100,
    packingQuestion: "Do you know the approximate weight of the safe?",
  },
];

export function getBulkyRule(className: string): BulkyRule | null {
  const lower = className.toLowerCase();
  return BULKY_RULES.find((r) => lower.includes(r.class)) ?? null;
}
