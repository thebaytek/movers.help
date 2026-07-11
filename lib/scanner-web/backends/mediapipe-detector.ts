import type { IWebDetector, RawDetection, DetectorBackend } from "../types";
import { normalizeClass } from "../label-map";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";

export class MediaPipeDetector implements IWebDetector {
  readonly backend: DetectorBackend = "mediapipe";
  private detector: import("@mediapipe/tasks-vision").ObjectDetector | null =
    null;
  private confidenceThreshold: number;

  constructor(confidenceThreshold = 0.5) {
    this.confidenceThreshold = confidenceThreshold;
  }

  async initialize(): Promise<void> {
    const { ObjectDetector, FilesetResolver } = await import(
      "@mediapipe/tasks-vision"
    );
    const wasm = await FilesetResolver.forVisionTasks(WASM_URL);
    this.detector = await ObjectDetector.createFromOptions(wasm, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: "VIDEO",
      scoreThreshold: this.confidenceThreshold,
      maxResults: 10,
    });
  }

  async detect(
    video: HTMLVideoElement,
    timestampMs: number,
  ): Promise<RawDetection[]> {
    if (!this.detector) {
      throw new Error("MediaPipeDetector not initialized");
    }

    const result = this.detector.detectForVideo(video, timestampMs);
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    return (result.detections ?? [])
      .filter((d) => (d.categories?.length ?? 0) > 0)
      .map((d) => {
        const top = d.categories![0];
        const box = d.boundingBox!;
        return {
          class: normalizeClass(top.categoryName ?? "unknown"),
          confidence: top.score ?? 0,
          bbox: {
            x: box.originX / w,
            y: box.originY / h,
            w: box.width / w,
            h: box.height / h,
          },
        };
      })
      .filter((d) => d.confidence >= this.confidenceThreshold);
  }

  dispose(): void {
    this.detector?.close();
    this.detector = null;
  }
}
