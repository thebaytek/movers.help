import { describe, it, expect } from "vitest";
import { DuplicateGuard } from "../spatial/duplicate-guard";

describe("DuplicateGuard", () => {
  it("returns isDuplicate: false for first item", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5 });
    const result = guard.checkDuplicate(1, "couch", { x: 0, y: 0, z: 2 });
    expect(result.isDuplicate).toBe(false);
  });

  it("detects duplicate when same class is within spatial radius", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5, classMatchRequired: true });

    // Mark first couch at (0, 0, 2)
    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });

    // Check second couch very close
    const result = guard.checkDuplicate(2, "couch", { x: 0.1, y: 0.1, z: 1.9 });
    expect(result.isDuplicate).toBe(true);
    expect(result.matchedId).toBe(1);
  });

  it("does not flag duplicate when positions are far apart", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5, classMatchRequired: true });

    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });

    // Far away couch
    const result = guard.checkDuplicate(2, "couch", { x: 5, y: 0, z: 2 });
    expect(result.isDuplicate).toBe(false);
  });

  it("does not flag duplicate when classes differ (classMatchRequired: true)", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5, classMatchRequired: true });

    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });

    // Chair at same position — different class
    const result = guard.checkDuplicate(2, "chair", { x: 0, y: 0, z: 2 });
    expect(result.isDuplicate).toBe(false);
  });

  it("flags duplicate regardless of class when classMatchRequired: false", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5, classMatchRequired: false });

    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });

    // Chair at same position — still a duplicate
    const result = guard.checkDuplicate(2, "chair", { x: 0, y: 0, z: 2 });
    expect(result.isDuplicate).toBe(true);
  });

  it("ignores same trackingId (self-check)", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5 });

    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });

    // Same trackingId at same position — not a duplicate (it's itself)
    const result = guard.checkDuplicate(1, "couch", { x: 0, y: 0, z: 2 });
    expect(result.isDuplicate).toBe(false);
  });

  it("returns isDuplicate: false when no 3D position provided", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5 });

    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });

    const result = guard.checkDuplicate(2, "couch");
    expect(result.isDuplicate).toBe(false);
  });

  it("removeStale clears old entries", () => {
    const guard = new DuplicateGuard({ spatialRadius: 0.5 });

    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });
    expect(guard.seenItems.size).toBe(1);

    // Simulate 35 seconds passing
    guard.removeStale(Date.now() + 35000, 30000);
    expect(guard.seenItems.size).toBe(0);
  });

  it("reset clears all seen items", () => {
    const guard = new DuplicateGuard();

    guard.markSeen(1, "couch", { x: 0, y: 0, z: 2 });
    guard.markSeen(2, "chair", { x: 1, y: 0, z: 2 });
    expect(guard.seenItems.size).toBe(2);

    guard.reset();
    expect(guard.seenItems.size).toBe(0);
  });
});
