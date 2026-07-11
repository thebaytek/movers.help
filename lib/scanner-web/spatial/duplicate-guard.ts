export interface Position3d {
  x: number;
  y: number;
  z: number;
}

export interface SeenEntry {
  trackingId: number;
  className: string;
  position3d: Position3d;
  timestamp: number;
}

export interface DuplicateResult {
  isDuplicate: boolean;
  matchedId?: number;
}

export interface DuplicateGuardConfig {
  spatialRadius?: number;
  classMatchRequired?: boolean;
}

export class DuplicateGuard {
  private spatialRadius: number;
  private classMatchRequired: boolean;
  seenItems: Map<number, SeenEntry> = new Map();

  constructor(config?: DuplicateGuardConfig) {
    this.spatialRadius = config?.spatialRadius ?? 0.5;
    this.classMatchRequired = config?.classMatchRequired ?? true;
  }

  checkDuplicate(
    trackingId: number,
    className: string,
    position3d?: Position3d,
  ): DuplicateResult {
    if (!position3d) {
      return { isDuplicate: false };
    }

    for (const entry of this.seenItems.values()) {
      if (entry.trackingId === trackingId) continue;

      const dx = entry.position3d.x - position3d.x;
      const dy = entry.position3d.y - position3d.y;
      const dz = entry.position3d.z - position3d.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (
        distance < this.spatialRadius &&
        (!this.classMatchRequired || entry.className === className)
      ) {
        return { isDuplicate: true, matchedId: entry.trackingId };
      }
    }

    return { isDuplicate: false };
  }

  markSeen(trackingId: number, className: string, position3d: Position3d): void {
    this.seenItems.set(trackingId, {
      trackingId,
      className,
      position3d,
      timestamp: Date.now(),
    });
  }

  removeStale(now: number, maxAgeMs: number = 30000): void {
    for (const [id, entry] of this.seenItems) {
      if (now - entry.timestamp > maxAgeMs) {
        this.seenItems.delete(id);
      }
    }
  }

  reset(): void {
    this.seenItems.clear();
  }
}
