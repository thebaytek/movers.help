import type { RawDetection } from "../types";

export interface TrackedItem extends RawDetection {
  trackingId: number;
  firstSeenAt: number;
  lastSeenAt: number;
  confirmationCount: number;
  confirmed: boolean;
  missCount: number;
}

export interface TrackResult {
  current: TrackedItem[];
  confirmed: TrackedItem[];
  newConfirmations: TrackedItem[];
}

export interface TrackerConfig {
  iouThreshold: number;
  maxMissedFrames: number;
  minConfirmations: number;
  /** EMA smoothing factor for bbox interpolation (0–1). 0 = no smoothing, closer to 1 = heavier smoothing. */
  bboxSmoothing: number;
}

const DEFAULTS: TrackerConfig = {
  iouThreshold: 0.3,
  maxMissedFrames: 5,
  minConfirmations: 2,
  bboxSmoothing: 0.35,
};

function computeIoU(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): number {
  const ax1 = a.x,
    ay1 = a.y,
    ax2 = a.x + a.w,
    ay2 = a.y + a.h;
  const bx1 = b.x,
    by1 = b.y,
    bx2 = b.x + b.w,
    by2 = b.y + b.h;
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1));
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
  const intersection = ix * iy;
  const union = a.w * a.h + b.w * b.h - intersection;
  return union > 0 ? intersection / union : 0;
}

export class SpatialTracker {
  private nextId = 1;
  private activeItems = new Map<number, TrackedItem>();
  private confirmedItems = new Map<number, TrackedItem>();
  private config: TrackerConfig;

  constructor(config?: Partial<TrackerConfig>) {
    this.config = { ...DEFAULTS, ...config };
  }

  track(detections: RawDetection[], timestamp: number): TrackResult {
    const tracked = Array.from(this.activeItems.values());

    // Build IoU pairs
    interface Pair {
      detIdx: number;
      trackId: number;
      iou: number;
    }
    const pairs: Pair[] = [];

    for (let di = 0; di < detections.length; di++) {
      for (const item of tracked) {
        const iou = computeIoU(detections[di].bbox, item.bbox);
        if (iou >= this.config.iouThreshold) {
          pairs.push({ detIdx: di, trackId: item.trackingId, iou });
        }
      }
    }

    // Greedy matching: sort pairs descending by IoU
    pairs.sort((a, b) => b.iou - a.iou);

    const matchedDets = new Set<number>();
    const matchedTracks = new Set<number>();

    for (const pair of pairs) {
      if (matchedDets.has(pair.detIdx) || matchedTracks.has(pair.trackId)) continue;
      matchedDets.add(pair.detIdx);
      matchedTracks.add(pair.trackId);

      const det = detections[pair.detIdx];
      const item = this.activeItems.get(pair.trackId)!;

      // EMA-smooth the bbox to eliminate jitter between frames
      const alpha = this.config.bboxSmoothing;
      if (item.confirmationCount > 0) {
        item.bbox = {
          x: item.bbox.x + (det.bbox.x - item.bbox.x) * alpha,
          y: item.bbox.y + (det.bbox.y - item.bbox.y) * alpha,
          w: item.bbox.w + (det.bbox.w - item.bbox.w) * alpha,
          h: item.bbox.h + (det.bbox.h - item.bbox.h) * alpha,
        };
      } else {
        item.bbox = det.bbox;
      }

      item.lastSeenAt = timestamp;
      item.confidence = det.confidence;
      item.confirmationCount++;
      item.missCount = 0;
    }

    // Unmatched detections -> new tracked items
    for (let di = 0; di < detections.length; di++) {
      if (matchedDets.has(di)) continue;
      const det = detections[di];
      const item: TrackedItem = {
        trackingId: this.nextId++,
        class: det.class,
        confidence: det.confidence,
        bbox: det.bbox,
        firstSeenAt: timestamp,
        lastSeenAt: timestamp,
        confirmationCount: 1,
        confirmed: false,
        missCount: 0,
      };
      this.activeItems.set(item.trackingId, item);
    }

    // Unmatched tracked items -> increment missCount, cull if expired
    const newConfirmations: TrackedItem[] = [];

    for (const item of tracked) {
      if (matchedTracks.has(item.trackingId)) continue;
      item.missCount++;
      if (item.missCount > this.config.maxMissedFrames) {
        this.activeItems.delete(item.trackingId);
      }
    }

    // Check for newly confirmed items
    for (const item of this.activeItems.values()) {
      if (!item.confirmed && item.confirmationCount >= this.config.minConfirmations) {
        item.confirmed = true;
        this.confirmedItems.set(item.trackingId, item);
        newConfirmations.push(item);
      }
    }

    return {
      current: Array.from(this.activeItems.values()),
      confirmed: Array.from(this.confirmedItems.values()),
      newConfirmations,
    };
  }

  reset(): void {
    this.nextId = 1;
    this.activeItems.clear();
    this.confirmedItems.clear();
  }

  getActiveItems(): TrackedItem[] {
    return Array.from(this.activeItems.values());
  }

  getConfirmedItems(): TrackedItem[] {
    return Array.from(this.confirmedItems.values());
  }
}
