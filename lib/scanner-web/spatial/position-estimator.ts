import type { NormalizedBbox } from "../types";
import type { Position3D } from "./duplicate-guard";

/**
 * Estimate a virtual 3D position from a 2D normalized bbox.
 * Web has no gyro/depth sensors, so we use bbox heuristics:
 * - x: horizontal offset from screen center (±2m range)
 * - y: vertical position (±1.5m, inverted Y axis)
 * - z: estimated distance from bbox area (1-3m, bigger = closer)
 */
export function estimatePosition3d(bbox: NormalizedBbox): Position3D {
  const cx = bbox.x + bbox.w / 2 - 0.5;
  const cy = bbox.y + bbox.h / 2 - 0.5;
  const x = cx * 4;
  const y = -cy * 3;
  const area = bbox.w * bbox.h;
  const z = 1 + (1 - area) * 2;
  return { x, y, z };
}
