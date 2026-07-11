import type { IWebDetector, RawDetection, DetectorBackend } from "../types";
import { normalizeClass } from "../label-map";

const SIMULATED_ITEMS = [
  { class: "couch", bbox: { x: 0.15, y: 0.3, w: 0.25, h: 0.25 } },
  { class: "chair", bbox: { x: 0.45, y: 0.2, w: 0.2, h: 0.35 } },
  { class: "tv", bbox: { x: 0.6, y: 0.35, w: 0.22, h: 0.28 } },
  { class: "bed", bbox: { x: 0.25, y: 0.55, w: 0.18, h: 0.22 } },
];

export class SimulatedDetector implements IWebDetector {
  readonly backend: DetectorBackend = "simulated";
  private index = 0;
  private confidenceThreshold: number;

  constructor(confidenceThreshold = 0.5) {
    this.confidenceThreshold = confidenceThreshold;
  }

  async initialize(): Promise<void> {
    // no-op
  }

  async detect(
    _video: HTMLVideoElement,
    _timestampMs: number,
  ): Promise<RawDetection[]> {
    const item = SIMULATED_ITEMS[this.index % SIMULATED_ITEMS.length];
    this.index++;

    const confidence = 0.6 + Math.random() * 0.35;
    if (confidence < this.confidenceThreshold) {
      return [];
    }

    return [
      {
        class: normalizeClass(item.class),
        confidence,
        bbox: { ...item.bbox },
      },
    ];
  }

  dispose(): void {
    this.index = 0;
  }
}
