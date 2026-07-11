/**
 * Phase 4: Contextual scan guide agent.
 * Room-aware state machine with voice prompts and bulky item warnings.
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
  "idle" | "scanning" | "room_complete" | "navigating" | "all_done";

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

const DEFAULT_ROOMS = [
  "Living Room", "Kitchen", "Bedroom", "Bathroom",
  "Office", "Garage", "Other",
];

export class ScanGuideAgent {
  private _state: GuideState = "idle";
  private _allRooms: string[];
  private _scannedRooms: Set<string> = new Set();
  private _currentRoom: string | null = null;
  private _itemsInCurrentRoom = 0;
  private _totalItems = 0;
  private _totalCuFt = 0;
  private _alertedBulky: Set<string> = new Set();

  constructor(rooms?: string[]) {
    this._allRooms = rooms ?? DEFAULT_ROOMS;
  }

  private _remainingRooms(): string[] {
    return this._allRooms.filter((r) => !this._scannedRooms.has(r));
  }

  private _nextRoomSuggestion(): string | null {
    const r = this._remainingRooms();
    return r.length > 0 ? r[0] : null;
  }

  private _progress() {
    return {
      scannedRooms: Array.from(this._scannedRooms),
      remainingRooms: this._remainingRooms(),
      totalItems: this._totalItems,
      totalCuFt: this._totalCuFt,
    };
  }

  // ── Public API ──────────────────────────────────────────

  onInit(): GuideEvent {
    this._state = "idle";
    const msg = idlePrompt();
    speak(msg);
    return {
      state: this._state,
      message: msg,
      bulkyAlert: null,
      nextRoomSuggestion: this._nextRoomSuggestion(),
      progress: this._progress(),
    };
  }

  onRoomChange(room: string): GuideEvent {
    const prev = this._currentRoom;
    if (prev && prev !== room && this._state === "scanning") {
      this._scannedRooms.add(prev);
      this._itemsInCurrentRoom = 0;
    }
    this._currentRoom = room;
    this._itemsInCurrentRoom = 0;
    this._state = "scanning";

    const msg = startPrompt(room);
    speak(msg);
    return {
      state: this._state,
      message: msg,
      bulkyAlert: null,
      nextRoomSuggestion: this._nextRoomSuggestion(),
      progress: this._progress(),
    };
  }

  onItemConfirmed(label: string, cls: string, cuFt: number): GuideEvent {
    this._itemsInCurrentRoom++;
    this._totalItems++;
    this._totalCuFt += cuFt;
    this._state = "scanning";

    // Bulky check
    const rule = getBulkyRule(cls);
    let bulky: GuideEvent["bulkyAlert"] = null;
    if (rule && !this._alertedBulky.has(cls)) {
      this._alertedBulky.add(cls);
      const bm = bulkyPrompt(label, rule.fee, rule.packingQuestion);
      speak(bm);
      bulky = { item: label, fee: rule.fee, question: rule.packingQuestion };
    }

    const room = this._currentRoom ?? "this room";
    const msg =
      this._itemsInCurrentRoom === 1
        ? firstItemPrompt(room)
        : itemConfirmPrompt(label, room, this._itemsInCurrentRoom);

    if (!bulky) speak(msg);

    return {
      state: this._state,
      message: bulky ? null : msg,
      bulkyAlert: bulky,
      nextRoomSuggestion: this._nextRoomSuggestion(),
      progress: this._progress(),
    };
  }

  onRoomDone(): GuideEvent {
    if (this._currentRoom) this._scannedRooms.add(this._currentRoom);
    const remaining = this._remainingRooms();

    if (remaining.length === 0) {
      this._state = "all_done";
      const msg = allDonePrompt(
        this._totalItems,
        this._totalCuFt,
        this._scannedRooms.size,
      );
      speak(msg);
      return {
        state: this._state,
        message: msg,
        bulkyAlert: null,
        nextRoomSuggestion: null,
        progress: this._progress(),
      };
    }

    const cMsg = roomCompletePrompt(
      this._currentRoom ?? "this room",
      this._itemsInCurrentRoom,
      this._totalCuFt,
    );
    const nMsg = navigatePrompt(remaining[0], remaining.length);
    speak(cMsg + " " + nMsg);
    this._state = "navigating";

    return {
      state: "navigating",
      message: cMsg + " " + nMsg,
      bulkyAlert: null,
      nextRoomSuggestion: remaining[0],
      progress: this._progress(),
    };
  }

  onIdleTick(): GuideEvent {
    if (this._state !== "scanning") {
      return {
        state: this._state,
        message: null,
        bulkyAlert: null,
        nextRoomSuggestion: this._nextRoomSuggestion(),
        progress: this._progress(),
      };
    }
    const msg = waitingPrompt(this._currentRoom ?? "this room");
    speak(msg);
    return {
      state: this._state,
      message: msg,
      bulkyAlert: null,
      nextRoomSuggestion: this._nextRoomSuggestion(),
      progress: this._progress(),
    };
  }

  getState(): GuideEvent {
    return {
      state: this._state,
      message: null,
      bulkyAlert: null,
      nextRoomSuggestion: this._nextRoomSuggestion(),
      progress: this._progress(),
    };
  }

  reset(): void {
    stopSpeaking();
    this._state = "idle";
    this._scannedRooms.clear();
    this._currentRoom = null;
    this._itemsInCurrentRoom = 0;
    this._totalItems = 0;
    this._totalCuFt = 0;
    this._alertedBulky.clear();
  }
}
