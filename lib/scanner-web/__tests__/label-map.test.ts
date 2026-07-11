import { describe, it, expect } from "vitest";
import { normalizeClass, toInventoryLabel } from "../label-map";

describe("normalizeClass", () => {
  it("lowercases and replaces underscores", () => {
    expect(normalizeClass("Dining_Table")).toBe("dining table");
  });

  it("trims whitespace", () => {
    expect(normalizeClass("  couch  ")).toBe("couch");
  });
});

describe("toInventoryLabel", () => {
  it("maps couch to Sofa (3-seater)", () => {
    expect(toInventoryLabel("couch")).toBe("Sofa (3-seater)");
  });

  it("returns title-cased unknown class", () => {
    expect(toInventoryLabel("unknown_thing")).toBe("Unknown Thing");
  });
});
