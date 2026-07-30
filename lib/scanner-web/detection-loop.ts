import type { IWebDetector, RawDetection } from "./types";

export function runDetectionLoop(
  detector: IWebDetector,
  video: HTMLVideoElement,
  fps: number,
  onDetections: (detections: RawDetection[]) => void,
): () => void {
  const frameIntervalMs = 1000 / fps;
  let rafId = 0;
  let lastDetectionTime = 0;
  let inFlight = false;
  let stopped = false;

  const tick = (now: number) => {
    if (stopped) return;
    rafId = requestAnimationFrame(tick);

    if (
      typeof document !== "undefined" &&
      document.hidden
    ) {
      return;
    }
    if (inFlight || video.readyState < 2) {
      return;
    }
    if (now - lastDetectionTime < frameIntervalMs) {
      return;
    }

    lastDetectionTime = now;
    inFlight = true;

    detector.detect(video, now)
      .then((detections) => {
        if (!stopped) onDetections(detections);
      })
      .catch(() => {
        // skip frame on detection error
      })
      .finally(() => {
        inFlight = false;
      });
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
  };
}
