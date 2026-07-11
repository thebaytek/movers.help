import type { IWebDetector, RawDetection, DetectorBackend } from "../types";
import { normalizeClass } from "../label-map";

export class TfjsDetector implements IWebDetector {
  readonly backend: DetectorBackend = "tfjs";
  private model: import("@tensorflow-models/coco-ssd").ObjectDetection | null =
    null;
  private confidenceThreshold: number;

  constructor(confidenceThreshold = 0.5) {
    this.confidenceThreshold = confidenceThreshold;
  }

  async initialize(): Promise<void> {
    await import("@tensorflow/tfjs");
    const cocoSsd = await import("@tensorflow-models/coco-ssd");
    this.model = await cocoSsd.load();
  }

  async detect(
    video: HTMLVideoElement,
    _timestampMs: number,
  ): Promise<RawDetection[]> {
    if (!this.model) {
      throw new Error("TfjsDetector not initialized");
    }

    const predictions = await this.model.detect(video);
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    return predictions
      .filter((p) => p.score >= this.confidenceThreshold)
      .map((p) => ({
        class: normalizeClass(p.class),
        confidence: p.score,
        bbox: {
          x: p.bbox[0] / w,
          y: p.bbox[1] / h,
          w: p.bbox[2] / w,
          h: p.bbox[3] / h,
        },
      }));
  }

  dispose(): void {
    this.model = null;
  }
}
