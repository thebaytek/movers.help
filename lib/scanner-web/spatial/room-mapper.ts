export class RoomMapper {
  currentRoom: string;
  roomHistory: { room: string; enteredAt: number }[];
  itemAssignments: Map<number, string>;
  previousMotionMagnitude: number;
  private readonly rooms: string[];

  constructor(rooms?: string[]) {
    this.rooms = rooms ?? [
      "Living Room",
      "Kitchen",
      "Bedroom",
      "Bathroom",
      "Office",
      "Garage",
      "Other",
    ];
    this.currentRoom = "Living Room";
    this.roomHistory = [];
    this.itemAssignments = new Map();
    this.previousMotionMagnitude = 0;
  }

  setCurrentRoom(room: string): void {
    this.currentRoom = room;
    this.roomHistory.push({ room, enteredAt: Date.now() });
  }

  getCurrentRoom(): string {
    return this.currentRoom;
  }

  assignItem(
    trackingId: number,
    _position3d?: { x: number; y: number; z: number },
  ): string {
    this.itemAssignments.set(trackingId, this.currentRoom);
    return this.currentRoom;
  }

  getItemsInRoom(room: string): number[] {
    const ids: number[] = [];
    this.itemAssignments.forEach((assignedRoom, trackingId) => {
      if (assignedRoom === room) ids.push(trackingId);
    });
    return ids;
  }

  getRoomSummary(): { room: string; itemCount: number }[] {
    const counts = new Map<string, number>();
    this.itemAssignments.forEach((room) => {
      counts.set(room, (counts.get(room) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([room, itemCount]) => ({ room, itemCount }))
      .sort((a, b) => b.itemCount - a.itemCount);
  }

  detectTransition(motionMagnitude: number): string | null {
    if (
      motionMagnitude > 0.5 &&
      motionMagnitude > this.previousMotionMagnitude * 2
    ) {
      this.previousMotionMagnitude = motionMagnitude;
      return "Moving to a new room? Tap to confirm.";
    }
    this.previousMotionMagnitude = motionMagnitude;
    return null;
  }

  reset(): void {
    this.itemAssignments.clear();
    this.currentRoom = "Living Room";
    this.roomHistory = [];
    this.previousMotionMagnitude = 0;
  }
}
