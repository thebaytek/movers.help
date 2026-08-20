import { describe, it, expect } from "vitest";
import {
  FURNITURE_SPECS,
  getFurnitureSpec,
  getFurnitureCuFt,
  normalizeFurnitureKey,
  ALL_FURNITURE_LABELS,
} from "@/lib/furniture";
import { ROOMS, getCuFt, calculateTotalCuFt } from "@/lib/inventory";
import { COCO_TO_INVENTORY } from "@/lib/truckConfig";

describe("furniture size table", () => {
  it("covers every item shown in the room pickers", () => {
    const allRoomItems = Object.values(ROOMS).flat();
    for (const label of allRoomItems) {
      expect(getFurnitureSpec(label), label).not.toBeNull();
    }
  });

  it("covers every COCO → inventory mapping the scanner produces", () => {
    for (const label of Object.values(COCO_TO_INVENTORY)) {
      expect(getFurnitureSpec(label), label).not.toBeNull();
    }
  });

  it("derives cu ft from the listed dimensions", () => {
    for (const spec of FURNITURE_SPECS) {
      const expected = Math.round(
        (spec.dimsInches[0] * spec.dimsInches[1] * spec.dimsInches[2]) /
          (12 ** 3) * 10,
      ) / 10;
      expect(spec.cuFt).toBe(expected);
      expect(spec.cuFt).toBeGreaterThan(0);
      expect(spec.dimsInches.every((d) => d > 0)).toBe(true);
    }
  });

  it("has unique normalized keys (no silent collisions)", () => {
    const keys = ALL_FURNITURE_LABELS.map(normalizeFurnitureKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("known furniture sizes", () => {
  it("sofa: 86×38×34 in → 64.3 cu ft", () => {
    expect(getFurnitureCuFt("Sofa (3-seater)")).toBe(64.3);
  });

  it("dining chair: 20×22×36 in → 9.2 cu ft", () => {
    expect(getFurnitureCuFt("Dining Chair")).toBe(9.2);
  });

  it("queen bed: 84×62×18 in → 54.3 cu ft", () => {
    expect(getFurnitureCuFt("Queen Bed")).toBe(54.3);
  });

  it("small box: 12×12×12 in → exactly 1 cu ft", () => {
    expect(getFurnitureCuFt("Small Box")).toBe(1);
  });

  it("refrigerator: 36×30×70 in → 43.8 cu ft", () => {
    expect(getFurnitureCuFt("Refrigerator")).toBe(43.8);
  });
});

describe("legacy + COCO aliases", () => {
  it("resolves legacy snake_case keys from the old table", () => {
    expect(getFurnitureCuFt("sofa_3seater")).toBe(64.3);
    expect(getFurnitureCuFt("sofa_2seater")).toBe(50.8);
    expect(getFurnitureCuFt("stoveoven")).toBe(18.5);
    expect(getFurnitureCuFt("queen_bed")).toBe(54.3);
    expect(getFurnitureCuFt("box_large")).toBe(3.4);
  });

  it("resolves COCO detection classes", () => {
    expect(getFurnitureCuFt("couch")).toBe(64.3);
    expect(getFurnitureCuFt("chair")).toBe(9.2);
    expect(getFurnitureCuFt("tv")).toBe(15);
    expect(getFurnitureCuFt("bed")).toBe(54.3);
    expect(getFurnitureCuFt("bookcase")).toBe(21);
  });

  it("resolves display labels with punctuation normalized", () => {
    expect(getFurnitureCuFt("Sofa (3-seater)")).toBe(getFurnitureCuFt("sofa 3 seater"));
    expect(getFurnitureCuFt("Stove/Oven")).toBe(18.5);
    expect(getFurnitureCuFt("Plant (Large)")).toBe(13.4);
  });

  it("returns null for unknown items", () => {
    expect(getFurnitureSpec("Random Object XYZ")).toBeNull();
    expect(getFurnitureCuFt("NonexistentItem")).toBeNull();
  });
});

describe("getCuFt integration", () => {
  it("returns the accurate table value for known labels", () => {
    expect(getCuFt("Sofa (3-seater)")).toBe(64.3);
    expect(getCuFt("Dining Chair")).toBe(9.2);
  });

  it("totalizes multiple items correctly", () => {
    const total = calculateTotalCuFt([
      { item: "Sofa (3-seater)", quantity: 1 },
      { item: "Dining Chair", quantity: 4 },
      { item: "Queen Bed", quantity: 1 },
    ]);
    expect(total).toBeCloseTo(64.3 + 4 * 9.2 + 54.3);
  });

  it("falls back to the default for unknown items", () => {
    expect(getCuFt("Some weird thing")).toBe(15);
  });
});
