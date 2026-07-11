export type {
  DetectorBackend,
  IWebDetector,
  NormalizedBbox,
  RawDetection,
  RoomSummary,
  ScannerSession,
  ScannerStatus,
  WebDetection,
  WebScanner,
  WebScannerOptions,
} from "./types";

export { normalizeClass, toInventoryLabel } from "./label-map";
export { createWebScanner } from "./orchestrator";
export { InventoryManager, mapRawDetections, buildRoomSummary } from "./inventory-state";

// Spatial modules (Phase 2)
export { SpatialTracker } from "./spatial/spatial-tracker";
export type { TrackedItem, TrackResult, TrackerConfig } from "./spatial/spatial-tracker";
export { DuplicateGuard } from "./spatial/duplicate-guard";
export type { DuplicateGuardConfig, DuplicateResult, Position3D } from "./spatial/duplicate-guard";
export { RoomMapper } from "./spatial/room-mapper";
export { estimatePosition3d } from "./spatial/position-estimator";

// Volume & depth (Phase 3)
export { VolumeCalculator } from "./geometry/volume-calculator";
export type { VolumeEstimate, VolumeCalculatorConfig } from "./geometry/volume-calculator";
export { BboxDepthEstimator, createDepthEstimator } from "./backends/depth-estimator";
export type { IDepthEstimator, DepthResult } from "./backends/depth-estimator";
