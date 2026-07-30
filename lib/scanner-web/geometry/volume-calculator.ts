import type { NormalizedBbox } from "../types";
import { getCuFt } from "@/lib/inventory";
import { lookupCuFtCached } from "../catalog";

/**
 * Phase 3: Estimate cubic footage from bbox + depth.
 * Primary source: Supabase furniture_catalog (cached in-memory).
 * Fallback: local getCuFt() lookup table.
 */
export interface VolumeEstimate {
  cuFt: number;
  method: "depth" | "catalog" | "lookup";
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
    // Cap at 200 cu ft — covers large sectionals (~135 cu ft) with headroom
    const cuFt = Math.max(1, Math.min(Math.round(cuM * 35.315), 200));

    return { cuFt, method: "depth", confidence: 0.7 };
  }

  private estimateFromLookup(inventoryLabel: string): VolumeEstimate {
    // 1. Try Supabase catalog (cached in-memory, highest confidence)
    const catalogCuFt = lookupCuFtCached(inventoryLabel);
    if (catalogCuFt != null) {
      return { cuFt: catalogCuFt, method: "catalog", confidence: 0.95 };
    }

    // 2. Fall back to local getCuFt() lookup table
    // getCuFt() always returns a number (defaults to 15 for unknown items)
    const rawCuFt = getCuFt(inventoryLabel);
    // Use our own fallbackCuFt config if getCuFt returned its generic default
    const cuFt = rawCuFt >= 15 ? this.config.fallbackCuFt : rawCuFt;
    return { cuFt, method: "lookup", confidence: 0.75 };
  }
}
