import type { NormalizedBbox } from "../types";

export interface DepthResult {
  depthMeters: number;
  confidence: number;
}

export interface IDepthEstimator {
  readonly backend: string;
  initialize(): Promise<void>;
  estimateDepth(
    bbox: NormalizedBbox,
    frameWidth: number,
    frameHeight: number,
  ): DepthResult;
  dispose(): void;
}

/**
 * Heuristic depth estimator based on bbox size.
 * Larger bbox = closer object.
 */
export class BboxDepthEstimator implements IDepthEstimator {
  readonly backend = "bbox-heuristic";

  async initialize(): Promise<void> {}

  estimateDepth(
    bbox: NormalizedBbox,
    _frameWidth: number,
    _frameHeight: number,
  ): DepthResult {
    const area = bbox.w * bbox.h;
    const depthMeters = 0.5 + (1 - area) * 4.5;
    const idealArea = 0.1;
    const areaDiff = Math.abs(area - idealArea);
    const confidence = Math.max(0.2, 1 - areaDiff * 3);
    return { depthMeters, confidence };
  }

  dispose(): void {}
}

export async function createDepthEstimator(): Promise<IDepthEstimator> {
  const estimator = new BboxDepthEstimator();
  await estimator.initialize();
  return estimator;
}
