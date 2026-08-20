import { describe, it, expect } from "vitest";
import { VolumeCalculator } from "../geometry/volume-calculator";
import type { NormalizedBbox } from "../types";

describe("VolumeCalculator", () => {
  const calc = new VolumeCalculator({ minDepthConfidence: 0.4, fallbackCuFt: 15 });

  describe("estimate (known furniture → canonical table)", () => {
    it("returns exact cu ft for a sofa regardless of depth", () => {
      const bbox: NormalizedBbox = { x: 0.2, y: 0.3, w: 0.3, h: 0.25 };
      const result = calc.estimate(bbox, "Sofa (3-seater)", 2.0, 0.9);
      expect(result.method).toBe("lookup");
      expect(result.cuFt).toBe(64.3); // 86×38×34 in → packed cu ft
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it("returns exact cu ft for a dining chair", () => {
      const bbox: NormalizedBbox = { x: 0.1, y: 0.1, w: 0.15, h: 0.2 };
      const result = calc.estimate(bbox, "Dining Chair");
      expect(result.method).toBe("lookup");
      expect(result.cuFt).toBe(9.2); // 20×22×36 in
    });

    it("returns exact cu ft for a tv stand", () => {
      const result = calc.estimate(
        { x: 0.1, y: 0.1, w: 0.2, h: 0.2 },
        "TV Stand",
      );
      expect(result.cuFt).toBe(15); // 60×18×24 in
    });

    it("resolves COCO classes through the furniture table", () => {
      expect(calc.estimate({ x: 0.1, y: 0.1, w: 0.2, h: 0.2 }, "couch").cuFt).toBe(64.3);
      expect(calc.estimate({ x: 0.1, y: 0.1, w: 0.2, h: 0.2 }, "tv").cuFt).toBe(15);
    });

    it("falls back to default for unknown item", () => {
      const bbox: NormalizedBbox = { x: 0.1, y: 0.1, w: 0.2, h: 0.2 };
      const result = calc.estimate(bbox, "Random Object XYZ");
      expect(result.cuFt).toBeGreaterThanOrEqual(15);
    });
  });

  describe("estimate (depth-based, unknown items only)", () => {
    it("uses depth when confidence is sufficient for an unknown item", () => {
      const bbox: NormalizedBbox = { x: 0.2, y: 0.3, w: 0.3, h: 0.25 };
      const result = calc.estimate(
        bbox,
        "mystery object",
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
        "mystery object",
        2.0,
        0.2, // below 0.4 threshold
      );
      expect(result.method).toBe("lookup");
      expect(result.cuFt).toBe(15);
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

    it("caps unknown-item depth guesses at a conservative ceiling", () => {
      const huge: NormalizedBbox = { x: 0.4, y: 0.4, w: 0.9, h: 0.9 };
      const result = calc.estimate(huge, "test", 10.0, 0.7);
      expect(result.cuFt).toBeLessThanOrEqual(40);
    });
  });

  describe("config overrides", () => {
    it("uses fallbackCuFt when getCuFt returns default for unknown item", () => {
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
      const result = strict.estimate(bbox, "mystery object", 2.0, 0.7);
      // 0.7 < 0.9 threshold → should use lookup
      expect(result.method).toBe("lookup");
    });
  });
});

