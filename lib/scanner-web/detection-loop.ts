import type { IWebDetector, RawDetection } from "./types";

export function runDetectionLoop(
  detector: IWebDetector,
  video: HTMLVideoElement,
  fps: number,
  onDetections: (detections: RawDetection[]) => void,
): () => void {
  const intervalMs = Math.round(1000 / fps);
  let inFlight = false;

  const tick = async () => {
    if (
      typeof document !== "undefined" &&
      document.hidden
    ) {
      return;
    }
    if (inFlight || video.readyState < 2) {
      return;
    }

    inFlight = true;
    try {
      const detections = await detector.detect(video, performance.now());
      onDetections(detections);
    } catch {
      // skip frame on detection error
    } finally {
      inFlight = false;
    }
  };

  const timer = setInterval(tick, intervalMs);
  return () => clearInterval(timer);
}
