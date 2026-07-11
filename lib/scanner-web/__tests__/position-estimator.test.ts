import { describe, it, expect } from "vitest";
import { estimatePosition3d } from "../spatial/position-estimator";
import type { NormalizedBbox } from "../types";

describe("estimatePosition3d", () => {
  it("returns center-origin position for centered bbox", () => {
    // Bbox centered in screen: at (0.4, 0.35, 0.2, 0.3)
    // Center: x=0.5, y=0.5 → cx=0, cy=0
    const bbox: NormalizedBbox = { x: 0.4, y: 0.35, w: 0.2, h: 0.3 };
    const pos = estimatePosition3d(bbox);

    expect(pos.x).toBeCloseTo(0, 5);
    expect(pos.y).toBeCloseTo(0, 5);
    // area = 0.06, z = 1 + (1 - 0.06) * 2 = 2.88
    expect(pos.z).toBeCloseTo(2.88, 1);
  });

  it("maps left-side bbox to negative x", () => {
    const bbox: NormalizedBbox = { x: 0, y: 0.3, w: 0.2, h: 0.2 };
    const pos = estimatePosition3d(bbox);

    // center = 0.1, cx = 0.1 - 0.5 = -0.4, x = -0.4 * 4 = -1.6
    expect(pos.x).toBeCloseTo(-1.6, 1);
    expect(pos.x).toBeLessThan(0);
  });

  it("maps right-side bbox to positive x", () => {
    const bbox: NormalizedBbox = { x: 0.8, y: 0.3, w: 0.2, h: 0.2 };
    const pos = estimatePosition3d(bbox);

    // center = 0.9, cx = 0.9 - 0.5 = 0.4, x = 0.4 * 4 = 1.6
    expect(pos.x).toBeCloseTo(1.6, 1);
    expect(pos.x).toBeGreaterThan(0);
  });

  it("maps top bbox to positive y (inverted)", () => {
    const bbox: NormalizedBbox = { x: 0.4, y: 0, w: 0.2, h: 0.2 };
    const pos = estimatePosition3d(bbox);

    // center y = 0.1, cy = 0.1 - 0.5 = -0.4, y = -(-0.4) * 3 = 1.2
    expect(pos.y).toBeCloseTo(1.2, 1);
    expect(pos.y).toBeGreaterThan(0);
  });

  it("maps bottom bbox to negative y", () => {
    const bbox: NormalizedBbox = { x: 0.4, y: 0.8, w: 0.2, h: 0.2 };
    const pos = estimatePosition3d(bbox);

    // center y = 0.9, cy = 0.9 - 0.5 = 0.4, y = -0.4 * 3 = -1.2
    expect(pos.y).toBeCloseTo(-1.2, 1);
    expect(pos.y).toBeLessThan(0);
  });

  it("gives closer z for larger bboxes", () => {
    const small: NormalizedBbox = { x: 0.3, y: 0.3, w: 0.1, h: 0.1 };
    const large: NormalizedBbox = { x: 0.2, y: 0.2, w: 0.5, h: 0.5 };

    const smallPos = estimatePosition3d(small);
    const largePos = estimatePosition3d(large);

    // Large bbox (close object) should have smaller z
    expect(largePos.z).toBeLessThan(smallPos.z);
  });
});
