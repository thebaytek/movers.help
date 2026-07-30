import type { RawDetection, WebDetection, RoomSummary } from "./types";
import { toInventoryLabel } from "./label-map";
import { SpatialTracker } from "./spatial/spatial-tracker";
import { DuplicateGuard } from "./spatial/duplicate-guard";
import { RoomMapper } from "./spatial/room-mapper";
import { estimatePosition3d } from "./spatial/position-estimator";
import { VolumeCalculator } from "./geometry/volume-calculator";
import { createDepthEstimator, type IDepthEstimator } from "./backends/depth-estimator";

/**
 * Phase 2-3: Spatial-aware inventory manager with volume sizing.
 * Tracks items across frames, deduplicates, assigns rooms, and estimates volume.
 */
export class InventoryManager {
  readonly tracker: SpatialTracker;
  readonly guard: DuplicateGuard;
  readonly mapper: RoomMapper;
  private volumeCalc: VolumeCalculator;
  private depthEstimator: IDepthEstimator | null = null;

  private _confirmedItems: WebDetection[] = [];

  constructor() {
    this.tracker = new SpatialTracker({
      iouThreshold: 0.3,
      maxMissedFrames: 5,
      minConfirmations: 2,
    });
    this.guard = new DuplicateGuard({
      spatialRadius: 0.5,
      classMatchRequired: true,
    });
    this.mapper = new RoomMapper();
    this.volumeCalc = new VolumeCalculator({ minDepthConfidence: 0.6 });
  }

  get confirmedItems(): WebDetection[] {
    return this._confirmedItems;
  }

  setRoom(room: string): void {
    this.mapper.setCurrentRoom(room);
  }

  getCurrentRoom(): string {
    return this.mapper.getCurrentRoom();
  }

  async initDepth(): Promise<void> {
    if (!this.depthEstimator) {
      this.depthEstimator = await createDepthEstimator();
    }
  }

  processFrame(
    rawDetections: RawDetection[],
    timestamp: number,
  ): {
    active: WebDetection[];
    newConfirmations: WebDetection[];
  } {
    const trackResult = this.tracker.track(rawDetections, timestamp);

    // Purge stale seen items to prevent unbounded growth
    this.guard.removeStale(timestamp, 30000);

    const newConfirmations: WebDetection[] = [];

    for (const item of trackResult.newConfirmations) {
      const pos3d = estimatePosition3d(item.bbox);

      const dup = this.guard.checkDuplicate(
        item.trackingId,
        item.class,
        pos3d,
      );

      if (!dup.isDuplicate) {
        this.guard.markSeen(item.trackingId, item.class, pos3d);
        this.mapper.assignItem(item.trackingId, pos3d);

        // Estimate volume (depth estimator is always initialized by initDepth())
        const depth = this.depthEstimator!.estimateDepth(item.bbox, 640, 480);
        const vol = this.volumeCalc.estimate(
          item.bbox,
          toInventoryLabel(item.class),
          depth.depthMeters,
          depth.confidence,
        );
        const volumeCuFt = vol.cuFt;

        const webDet: WebDetection = {
          trackingId: item.trackingId,
          class: item.class,
          inventoryLabel: toInventoryLabel(item.class),
          confidence: item.confidence,
          bbox: item.bbox,
          volumeCuFt,
          room: this.mapper.getCurrentRoom(),
          confirmed: true,
        };

        this._confirmedItems.push(webDet);
        newConfirmations.push(webDet);
      }
    }

    const active = trackResult.current.map((item) => {
      const assignedRoom =
        this.mapper.itemAssignments.get(item.trackingId) ??
        this.mapper.getCurrentRoom();

      return {
        trackingId: item.trackingId,
        class: item.class,
        inventoryLabel: toInventoryLabel(item.class),
        confidence: item.confidence,
        bbox: item.bbox,
        volumeCuFt: 0,
        room: assignedRoom,
        confirmed: item.confirmed,
      } satisfies WebDetection;
    });

    return { active, newConfirmations };
  }

  getRoomSummary(): RoomSummary[] {
    const counts = new Map<string, { itemCount: number; cuFt: number }>();

    for (const item of this._confirmedItems) {
      const room = item.room ?? "Other";
      const entry = counts.get(room) ?? { itemCount: 0, cuFt: 0 };
      entry.itemCount += 1;
      entry.cuFt += item.volumeCuFt;
      counts.set(room, entry);
    }

    return Array.from(counts.entries())
      .map(([room, stats]) => ({ room, ...stats }))
      .sort((a, b) => b.itemCount - a.itemCount);
  }

  reset(): void {
    this.depthEstimator?.dispose();
    this.depthEstimator = null;
    this.tracker.reset();
    this.guard.reset();
    this.mapper.reset();
    this._confirmedItems = [];
  }
}

// Backward-compatible utility exports
export function mapRawDetections(
  raw: RawDetection[],
  room: string | null,
): WebDetection[] {
  return raw.map((d, index) => ({
    trackingId: index,
    class: d.class,
    inventoryLabel: toInventoryLabel(d.class),
    confidence: d.confidence,
    bbox: d.bbox,
    volumeCuFt: 0,
    room,
    confirmed: false,
  }));
}

export function buildRoomSummary(
  items: WebDetection[],
): RoomSummary[] {
  const counts = new Map<string, { itemCount: number; cuFt: number }>();

  for (const item of items) {
    const room = item.room ?? "Other";
    const entry = counts.get(room) ?? { itemCount: 0, cuFt: 0 };
    entry.itemCount += 1;
    entry.cuFt += item.volumeCuFt;
    counts.set(room, entry);
  }

  return Array.from(counts.entries())
    .map(([room, stats]) => ({ room, ...stats }))
    .sort((a, b) => b.itemCount - a.itemCount);
}
