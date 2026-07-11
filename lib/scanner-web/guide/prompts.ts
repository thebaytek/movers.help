/**
 * Contextual prompt templates for the scan guide agent.
 * All prompts are room-aware and dynamically filled.
 */

// ── Room names ──────────────────────────────────────────────

const ROOM_ARTICLES: Record<string, string> = {
  "Living Room": "the living room",
  Kitchen: "the kitchen",
  Bedroom: "the first bedroom",
  Bathroom: "the bathroom",
  Office: "the office",
  Garage: "the garage",
  Other: "this area",
};

function roomPhrase(room: string): string {
  return ROOM_ARTICLES[room] ?? `the ${room.toLowerCase()}`;
}

// ── Prompt generators ───────────────────────────────────────

export function startPrompt(room: string): string {
  return `Let's scan ${roomPhrase(room)}. Point your camera around slowly so I can see everything.`;
}

export function firstItemPrompt(room: string): string {
  return `I'm starting to see things in ${roomPhrase(room)}. Keep going — show me each piece of furniture.`;
}

export function itemConfirmPrompt(
  itemLabel: string,
  room: string,
  count: number,
): string {
  if (count === 1) {
    return `Got it — I see a ${itemLabel.toLowerCase()} in ${roomPhrase(room)}.`;
  }
  return `That's ${count} items now in ${roomPhrase(room)}, including a ${itemLabel.toLowerCase()}.`;
}

export function roomCompletePrompt(
  room: string,
  itemCount: number,
  cuFt: number,
): string {
  if (itemCount === 0) {
    return `I didn't catch anything in ${roomPhrase(room)}. Ready to try the next room?`;
  }
  return `Great, ${roomPhrase(room)} is done. That's ${itemCount} items — about ${cuFt} cubic feet.`;
}

export function navigatePrompt(
  nextRoom: string,
  remainingCount: number,
): string {
  if (remainingCount === 1) {
    return `Last one! Now walk to ${roomPhrase(nextRoom)} and give me a look around.`;
  }
  return `Now walk to ${roomPhrase(nextRoom)} and give me a look around. ${remainingCount} more rooms to go.`;
}

export function allDonePrompt(
  totalItems: number,
  totalCuFt: number,
  roomCount: number,
): string {
  return `All done! You've scanned ${totalItems} items across ${roomCount} rooms — about ${totalCuFt} cubic feet total. Ready to see how it fits in a truck?`;
}

export function bulkyPrompt(
  itemLabel: string,
  fee: number,
  question: string,
): string {
  return `Heads up — the ${itemLabel.toLowerCase()} has a $${fee} bulky item fee. ${question}`;
}

export function idlePrompt(): string {
  return "Ready to scan your home. Start in any room — point your camera at each piece of furniture.";
}

export function waitingPrompt(room: string): string {
  return `I'm in ${roomPhrase(room)}. Point your camera at the furniture and hold still for a moment on each item.`;
}
