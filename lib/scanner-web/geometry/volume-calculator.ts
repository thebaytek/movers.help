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
  minDepthConfidence: 0.4,
  fallbackCuFt: 15,
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

    const widthM = 2 * depthMeters * Math.tan(fovH / 2) * bbox.w;
    const heightM = 2 * depthMeters * Math.tan(fovV / 2) * bbox.h;
    const depthObjM = ((widthM + heightM) / 2) * 0.6;

    const cuM = widthM * heightM * depthObjM;
    const cuFt = Math.max(1, Math.round(cuM * 35.315));

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
    const cuFt = getCuFt(inventoryLabel);
    return { cuFt, method: "lookup", confidence: 0.75 };
  }
}
