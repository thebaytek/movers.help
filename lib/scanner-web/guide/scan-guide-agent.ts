/**
 * Phase 4: Contextual scan guide agent.
 *
 * State machine with room awareness, voice prompts, and bulky item warnings.
 * States: idle → scanning → room_complete → navigating → scanning → … → all_done
 */

import { speak, stopSpeaking } from "./speech";
import { getBulkyRule } from "./bulky-rules";
import {
  startPrompt, firstItemPrompt, itemConfirmPrompt,
  roomCompletePrompt, navigatePrompt, allDonePrompt,
  bulkyPrompt, idlePrompt, waitingPrompt,
} from "./prompts";

export type GuideState =
  | "idle" | "scanning" | "room_complete" | "navigating" | "all_done";

export interface GuideEvent {
  state: GuideState;
  message: string | null;
  bulkyAlert: { item: string; fee: number; question: string } | null;
  nextRoomSuggestion: string | null;
  progress: {
    scannedRooms: string[];
    remainingRooms: string[];
    totalItems: number;
    totalCuFt: number;
  };
}

export class ScanGuideAgent {
  private state: GuideState = "idle";
  private allRooms: string[];
  private scannedRooms = new Set<string>();
  private currentRoom: string | null = null;
  private itemsInCurrentRoom = 0;
  private totalItems = 0;
  private totalCuFt = 0;
  private alertedBulky = new Set<string>();

  constructor(rooms?: string[]) {
    this.allRooms = rooms ?? [
      "Living Room", "Kitchen", "Bedroom", "Bathroom",
      "Office", "Garage", "Other",
    ];
  }

  private get remainingRooms(): string[] {
    return this.allRooms.filter((r) => !this.scannedRooms.has(r));
  }

  private get nextRoomSuggestion(): string | null {
    const r = this.remainingRooms;
    return r.length > 0 ? r[0] : null;
  }

  private get progress() {
    return {
      scannedRooms: Array.from(this.scannedRooms),
      remainingRooms: this.remainingRooms,
      totalItems: this.totalItems,

  // ── Public API ──────────────────────────────────────────

  onInit(): GuideEvent {
    this.state = "idle";
    const msg = idlePrompt();
    speak(msg);
    return { state: this.state, message: msg, bulkyAlert: null,
      nextRoomSuggestion: this.nextRoomSuggestion, progress: this.progress };
  }

  onRoomChange(room: string): GuideEvent {
    const prev = this.currentRoom;
    if (prev && prev !== room && this.state === "scanning") {
      this.scannedRooms.add(prev);
      this.itemsInCurrentRoom = 0;
    }
    this.currentRoom = room;
    this.itemsInCurrentRoom = 0;
    this.state = "scanning";

    const msg = startPrompt(room);
    speak(msg);
    return { state: this.state, message: msg, bulkyAlert: null,
      nextRoomSuggestion: this.nextRoomSuggestion, progress: this.progress };
  }

  onItemConfirmed(label: string, cls: string, cuFt: number): GuideEvent {
    this.itemsInCurrentRoom++;
    this.totalItems++;
    this.totalCuFt += cuFt;
    this.state = "scanning";

    // Bulky check
    const rule = getBulkyRule(cls);
    let bulky: GuideEvent["bulkyAlert"] = null;
    if (rule && !this.alertedBulky.has(cls)) {
      this.alertedBulky.add(cls);
      const bm = bulkyPrompt(label, rule.fee, rule.packingQuestion);
      speak(bm);
      bulky = { item: label, fee: rule.fee, question: rule.packingQuestion };
    }

    const room = this.currentRoom ?? "this room";
    const msg = this.itemsInCurrentRoom === 1
      ? firstItemPrompt(room)
      : itemConfirmPrompt(label, room, this.itemsInCurrentRoom);

    if (!bulky) speak(msg);

    return { state: this.state, message: bulky ? null : msg, bulkyAlert: bulky,
      nextRoomSuggestion: this.nextRoomSuggestion, progress: this.progress };
  }

  onRoomDone(): GuideEvent {
    if (this.currentRoom) this.scannedRooms.add(this.currentRoom);
    const remaining = this.remainingRooms;

    if (remaining.length === 0) {
      this.state = "all_done";
      const msg = allDonePrompt(this.totalItems, this.totalCuFt, this.scannedRooms.size);
      speak(msg);
      return { state: this.state, message: msg, bulkyAlert: null,
        nextRoomSuggestion: null, progress: this.progress };
    }

    const cMsg = roomCompletePrompt(
      this.currentRoom ?? "this room",
      this.itemsInCurrentRoom,
      this.totalCuFt,
    );
    const nMsg = navigatePrompt(remaining[0], remaining.length);
    speak(cMsg + " " + nMsg);
    this.state = "navigating";

    return { state: "navigating", message: cMsg + " " + nMsg, bulkyAlert: null,
      nextRoomSuggestion: remaining[0], progress: this.progress };
  }

  onIdleTick(): GuideEvent {
    if (this.state !== "scanning") {
      return { state: this.state, message: null, bulkyAlert: null,
        nextRoomSuggestion: this.nextRoomSuggestion, progress: this.progress };
    }
    const msg = waitingPrompt(this.currentRoom ?? "this room");
    speak(msg);
    return { state: this.state, message: msg, bulkyAlert: null,
      nextRoomSuggestion: this.nextRoomSuggestion, progress: this.progress };
  }

  getState(): GuideEvent {
    return { state: this.state, message: null, bulkyAlert: null,
      nextRoomSuggestion: this.nextRoomSuggestion, progress: this.progress };
  }

  reset(): void {
    stopSpeaking();
    this.state = "idle";
    this.scannedRooms.clear();
    this.currentRoom = null;
    this.itemsInCurrentRoom = 0;
    this.totalItems = 0;
    this.totalCuFt = 0;
    this.alertedBulky.clear();
  }
}
      totalCuFt: this.totalCuFt,
    };
  }