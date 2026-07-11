import { describe, it, expect } from "vitest";
import { SpatialTracker } from "../spatial/spatial-tracker";
import type { RawDetection } from "../types";

function makeDet(
  cls: string,
  x: number,
  y: number,
  w: number,
  h: number,
  conf = 0.8,
): RawDetection {
  return { class: cls, confidence: conf, bbox: { x, y, w, h } };
}

describe("SpatialTracker", () => {
  it("assigns tracking IDs to new detections", () => {
    const tracker = new SpatialTracker();
    const result = tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1000);

    expect(result.current).toHaveLength(1);
    expect(result.current[0].trackingId).toBe(1);
    expect(result.current[0].class).toBe("couch");
    expect(result.current[0].confirmed).toBe(false);
  });

  it("matches same object across frames via IoU", () => {
    const tracker = new SpatialTracker({ iouThreshold: 0.2 });

    // Frame 1: couch appears
    tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1000);

    // Frame 2: couch slightly shifted — should match same trackingId
    const result = tracker.track([makeDet("couch", 0.12, 0.31, 0.3, 0.2)], 1500);

    expect(result.current).toHaveLength(1);
    expect(result.current[0].trackingId).toBe(1);
    expect(result.current[0].confirmationCount).toBe(2);
  });

  it("assigns new trackingId for non-overlapping detection", () => {
    const tracker = new SpatialTracker({ iouThreshold: 0.3 });

    tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1000);

    // Far-away chair — no IoU overlap with couch
    const result = tracker.track([makeDet("chair", 0.7, 0.7, 0.2, 0.2)], 1500);

    expect(result.current).toHaveLength(2);
    const ids = result.current.map((i) => i.trackingId);
    expect(ids).toContain(1); // couch
    expect(ids).toContain(2); // new chair
  });

  it("confirms items after minConfirmations frames", () => {
    const tracker = new SpatialTracker({ minConfirmations: 2, iouThreshold: 0.2 });

    // Frame 1
    tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1000);

    // Frame 2 — confirmationCount hits 2 → confirmed
    const result = tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1500);

    expect(result.newConfirmations).toHaveLength(1);
    expect(result.newConfirmations[0].confirmed).toBe(true);
    expect(result.confirmed).toHaveLength(1);
  });

  it("culls items after maxMissedFrames", () => {
    const tracker = new SpatialTracker({ maxMissedFrames: 2, iouThreshold: 0.3 });

    // Frame 1: couch appears
    tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1000);

    // Frames 2-3: couch missing
    tracker.track([], 1500); // miss 1
    tracker.track([], 2000); // miss 2

    // Frame 4: miss 3 — should be culled
    const result = tracker.track([], 2500);

    expect(result.current).toHaveLength(0); // culled
    const confirmed = tracker.getConfirmedItems();
    // Was never confirmed (needs minConfirmations), so no confirmed items
    expect(confirmed).toHaveLength(0);
  });

  it("keeps confirmed items even when culled from active", () => {
    const tracker = new SpatialTracker({
      minConfirmations: 2,
      maxMissedFrames: 1,
      iouThreshold: 0.2,
    });

    // Frame 1-2: confirm couch
    tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1000);
    const r2 = tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1500);
    expect(r2.newConfirmations).toHaveLength(1);

    // Frame 3: couch missing → culled from active but stays confirmed
    tracker.track([], 2000);
    tracker.track([], 2500);

    const confirmed = tracker.getConfirmedItems();
    expect(confirmed).toHaveLength(1);
    expect(confirmed[0].trackingId).toBe(1);
  });

  it("greedy matching prevents double assignment", () => {
    const tracker = new SpatialTracker({ iouThreshold: 0.2 });

    // Two detections close together
    const dets = [
      makeDet("chair", 0.1, 0.3, 0.2, 0.2),
      makeDet("chair", 0.12, 0.32, 0.2, 0.2), // overlaps heavily with first
    ];

    const result = tracker.track(dets, 1000);

    // Each detection gets its own tracking ID
    expect(result.current).toHaveLength(2);
    expect(result.current[0].trackingId).not.toBe(result.current[1].trackingId);
  });

  it("reset clears all state", () => {
    const tracker = new SpatialTracker();

    tracker.track([makeDet("couch", 0.1, 0.3, 0.3, 0.2)], 1000);
    expect(tracker.getActiveItems()).toHaveLength(1);

    tracker.reset();

    expect(tracker.getActiveItems()).toHaveLength(0);
    expect(tracker.getConfirmedItems()).toHaveLength(0);
  });
});
