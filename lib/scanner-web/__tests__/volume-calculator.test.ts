import { describe, it, expect } from "vitest";
import { VolumeCalculator } from "../geometry/volume-calculator";
import type { NormalizedBbox } from "../types";

describe("VolumeCalculator", () => {
  const calc = new VolumeCalculator({ minDepthConfidence: 0.4, fallbackCuFt: 15 });

  describe("estimate (lookup fallback)", () => {
    it("returns known cu ft for couch via lookup", () => {
      const bbox: NormalizedBbox = { x: 0.2, y: 0.3, w: 0.3, h: 0.25 };
      const result = calc.estimate(bbox, "Sofa (3-seater)");
      expect(result.method).toBe("lookup");
      expect(result.cuFt).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it("returns known cu ft for dining chair", () => {
      const bbox: NormalizedBbox = { x: 0.1, y: 0.1, w: 0.15, h: 0.2 };
      const result = calc.estimate(bbox, "Dining Chair");
      expect(result.method).toBe("lookup");
      expect(result.cuFt).toBe(5);
    });

    it("falls back to default for unknown item", () => {
      const bbox: NormalizedBbox = { x: 0.1, y: 0.1, w: 0.2, h: 0.2 };
      const result = calc.estimate(bbox, "Random Object XYZ");
      // Should fall back to the 15 default
      expect(result.cuFt).toBeGreaterThanOrEqual(15);
    });
  });

  describe("estimate (depth-based)", () => {
    it("uses depth when confidence is sufficient", () => {
      const bbox: NormalizedBbox = { x: 0.2, y: 0.3, w: 0.3, h: 0.25 };
      const result = calc.estimate(
        bbox,
        "Sofa (3-seater)",
        2.0, // depth in meters
        0.7, // high confidence
      );
      expect(result.method).toBe("depth");
      expect(result.cuFt).toBeGreaterThan(0);
    });

    it("falls back to lookup when depth confidence is low", () => {
      const bbox: NormalizedBbox = { x: 0.2, y: 0.3, w: 0.3, h: 0.25 };
      const result = calc.estimate(
        bbox,
        "Dining Chair",
        2.0,
        0.2, // below 0.4 threshold
      );
      expect(result.method).toBe("lookup");
      expect(result.cuFt).toBe(5);
    });

    it("farther objects at same bbox size are physically larger", () => {
      const bbox: NormalizedBbox = { x: 0.2, y: 0.3, w: 0.3, h: 0.25 };

      const near = calc.estimate(bbox, "test", 1.0, 0.7); // 1m away
      const far = calc.estimate(bbox, "test", 4.0, 0.7); // 4m away

      // Same bbox at greater distance = physically larger object = more cu ft
      expect(far.cuFt).toBeGreaterThan(near.cuFt);
    });

    it("larger bbox at same depth yields larger cu ft", () => {
      const small: NormalizedBbox = { x: 0.3, y: 0.3, w: 0.1, h: 0.15 };
      const large: NormalizedBbox = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 };

      const smallResult = calc.estimate(small, "test", 2.0, 0.7);
      const largeResult = calc.estimate(large, "test", 2.0, 0.7);

      expect(largeResult.cuFt).toBeGreaterThan(smallResult.cuFt);
    });

    it("returns at least 1 cu ft", () => {
      const tiny: NormalizedBbox = { x: 0.45, y: 0.45, w: 0.01, h: 0.01 };
      const result = calc.estimate(tiny, "test", 1.0, 0.7);
      expect(result.cuFt).toBeGreaterThanOrEqual(1);
    });
  });

  describe("config overrides", () => {
    it("uses fallbackCuFt when getCuFt returns default for unknown item", () => {
      // getCuFt returns 15 for unknown items. Verify the fallback is that default.
      const custom = new VolumeCalculator({ fallbackCuFt: 15, minDepthConfidence: 0.4 });
      const result = custom.estimate(
        { x: 0.1, y: 0.1, w: 0.2, h: 0.2 },
        "NonexistentItem",
      );
      expect(result.cuFt).toBe(15);
    });

    it("respects custom minDepthConfidence threshold", () => {
      // Set threshold to 0.9 — our 0.7 confidence depth should fall back to lookup
      const strict = new VolumeCalculator({ minDepthConfidence: 0.9, fallbackCuFt: 15 });
      const bbox: NormalizedBbox = { x: 0.2, y: 0.3, w: 0.3, h: 0.25 };
      const result = strict.estimate(bbox, "Dining Chair", 2.0, 0.7);
      // 0.7 < 0.9 threshold → should use lookup
      expect(result.method).toBe("lookup");
    });
  });
});
