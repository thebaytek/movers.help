import type { IWebDetector } from "../types";
import { MediaPipeDetector } from "./mediapipe-detector";
import { TfjsDetector } from "./tfjs-detector";
import { SimulatedDetector } from "./simulated-detector";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("init timeout")), ms),
    ),
  ]);
}

export async function createDetector(
  confidenceThreshold = 0.5,
  timeoutMs = 10_000,
): Promise<IWebDetector> {
  const mediapipe = new MediaPipeDetector(confidenceThreshold);
  try {
    await withTimeout(mediapipe.initialize(), timeoutMs);
    return mediapipe;
  } catch {
    mediapipe.dispose();
  }

  const tfjs = new TfjsDetector(confidenceThreshold);
  try {
    await withTimeout(tfjs.initialize(), timeoutMs);
    return tfjs;
  } catch {
    tfjs.dispose();
  }

  const simulated = new SimulatedDetector(confidenceThreshold);
  await simulated.initialize();
  return simulated;
}
