import type { NormalizedBbox } from "../types";
import { getCuFt } from "@/lib/inventory";
import { getFurnitureCuFt } from "@/lib/furniture";
import { lookupCuFtCached } from "../catalog";

/**
 * Phase 3: Estimate cubic footage from bbox + depth.
 *
 * Accuracy order (matches the canonical furniture table in lib/furniture.ts):
 *   1. Known furniture label → exact cu ft from its real packed dimensions
 *      (a scanned "couch" is a couch, not a guess from pixels).
 *   2. Supabase furniture_catalog (cached in-memory) — legacy secondary source.
 *   3. Depth/bbox heuristic — only for unknown classes, clamped to a sane
 *      range because a monocular webcam has no true depth sensor.
 */
export interface VolumeEstimate {
  cuFt: number;
  method: "lookup" | "catalog" | "depth";
  confidence: number;
}

export interface VolumeCalculatorConfig {
  minDepthConfidence: number;
  fallbackCuFt: number;
}

const DEFAULTS: VolumeCalculatorConfig = {
  minDepthConfidence: 0.6,
  fallbackCuFt: 8,
};

/** Sane bounds for depth-heuristic guesses (unknown items only). */
const DEPTH_MIN_CUFT = 1;
const DEPTH_MAX_CUFT = 40;

export class VolumeCalculator {
  private config: VolumeCalculatorConfig;

  constructor(config?: Partial<VolumeCalculatorConfig>) {
    this.config = { ...DEFAULTS, ...config };
  }

  estimate(
    bbox: NormalizedBbox,
    inventoryLabel: string,
    depthMeters?: number,
    depthConfidence?: number,
  ): VolumeEstimate {
    // Known furniture → the table is authoritative. No pixel guessing needed.
    const tableCuFt = getFurnitureCuFt(inventoryLabel);
    if (tableCuFt != null) {
      return { cuFt: tableCuFt, method: "lookup", confidence: 0.95 };
    }

    // Unknown class → try the depth heuristic only if its confidence is high
    // enough, otherwise fall through to the catalog / generic fallback.
    if (
      depthMeters != null &&
      depthConfidence != null &&
      depthConfidence >= this.config.minDepthConfidence
    ) {
      return this.estimateFromDepth(bbox, depthMeters);
    }

    return this.estimateFromLookup(inventoryLabel);
  }

  private estimateFromDepth(
    bbox: NormalizedBbox,
    depthMeters: number,
  ): VolumeEstimate {
    const fovH = (65 * Math.PI) / 180;
    const fovV = fovH * 0.75;

    // Clamp depth-based dimensions to reasonable furniture sizes
    let widthM = 2 * depthMeters * Math.tan(fovH / 2) * bbox.w;
    let heightM = 2 * depthMeters * Math.tan(fovV / 2) * bbox.h;

    // Sanity clamps: allow large items like sectionals (up to ~4m wide, ~3m tall)
    widthM = Math.max(0.2, Math.min(widthM, 4));
    heightM = Math.max(0.2, Math.min(heightM, 3));

    const depthObjM = ((widthM + heightM) / 2) * 0.6;

    const cuM = widthM * heightM * depthObjM;
    // Clamp hard — a monocular webcam overestimates tiny far-away bboxes badly,
    // so cap unknown-item guesses at a conservative 40 cu ft.
    const cuFt = Math.max(
      DEPTH_MIN_CUFT,
      Math.min(Math.round(cuM * 35.315), DEPTH_MAX_CUFT),
    );

    return { cuFt, method: "depth", confidence: 0.5 };
  }

  private estimateFromLookup(inventoryLabel: string): VolumeEstimate {
    // 1. Local furniture table (canonical). Usually already handled in
    //    estimate(), but keep as a safety net.
    const tableCuFt = getFurnitureCuFt(inventoryLabel);
    if (tableCuFt != null) {
      return { cuFt: tableCuFt, method: "lookup", confidence: 0.95 };
    }

    // 2. Supabase catalog (cached in-memory, legacy secondary source)
    const catalogCuFt = lookupCuFtCached(inventoryLabel);
    if (catalogCuFt != null) {
      return { cuFt: catalogCuFt, method: "catalog", confidence: 0.9 };
    }

    // 3. Generic fallback for truly unknown items
    const rawCuFt = getCuFt(inventoryLabel);
    const cuFt = rawCuFt >= 15 ? this.config.fallbackCuFt : rawCuFt;
    return { cuFt, method: "lookup", confidence: 0.6 };
  }
}

