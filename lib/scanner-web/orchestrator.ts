import { startWebCamera, stopWebCamera, type WebCamera } from "./camera";
import { createDetector } from "./backends/create-detector";
import { runDetectionLoop } from "./detection-loop";
import { InventoryManager } from "./inventory-state";
import type {
  DetectorBackend,
  IWebDetector,
  ScannerSession,
  WebScanner,
  WebScannerOptions,
} from "./types";

function newSessionId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptySession(
  backend: DetectorBackend = "simulated",
): ScannerSession {
  return {
    id: newSessionId(),
    status: "idle",
    backend,
    detections: [],
    confirmedItems: [],
    totalCuFt: 0,
    roomSummary: [],
  };
}

export function createWebScanner(options?: WebScannerOptions): WebScanner {
  const confidenceThreshold = options?.confidenceThreshold ?? 0.5;
  const fps = options?.fps ?? 5;

  let detector: IWebDetector | null = null;
  let camera: WebCamera | null = null;
  let stopLoop: (() => void) | null = null;
  let session = emptySession();
  let onUpdate: ((s: ScannerSession) => void) | null = null;

  const inventory = new InventoryManager();

  const emit = () => {
    onUpdate?.(session);
  };

  return {
    async initialize(): Promise<void> {
      session = { ...emptySession(), status: "loading" };
      emit();
      detector = await createDetector(confidenceThreshold);
      session = {
        ...session,
        status: "idle",
        backend: detector.backend,
      };
      await inventory.initDepth();
      emit();
    },

    async startCamera(container: HTMLElement): Promise<void> {
      if (!detector) {
        throw new Error("Scanner not initialized");
      }
      camera = await startWebCamera(container);
      session = { ...session, status: "scanning" };
      emit();
    },

    startScanning(callback: (s: ScannerSession) => void): void {
      if (!detector || !camera) {
        throw new Error("Camera not started");
      }

      onUpdate = callback;

      stopLoop = runDetectionLoop(detector, camera.video, fps, (raw) => {
        const { active, newConfirmations } = inventory.processFrame(
          raw,
          performance.now(),
        );
        session = {
          ...session,
          detections: active,
          confirmedItems: inventory.confirmedItems,
          totalCuFt: inventory.confirmedItems.reduce((sum, item) => sum + item.volumeCuFt, 0),
          roomSummary: inventory.getRoomSummary(),
        };
        emit();
      });
    },

    setRoom(room: string): void {
      inventory.setRoom(room);
    },

    stopScanning(): void {
      stopLoop?.();
      stopLoop = null;
    },

    dispose(): void {
      this.stopScanning();
      if (camera) {
        stopWebCamera(camera);
        camera = null;
      }
      detector?.dispose();
      detector = null;
      inventory.reset();
      session = emptySession();
      onUpdate = null;
    },
  };
}
