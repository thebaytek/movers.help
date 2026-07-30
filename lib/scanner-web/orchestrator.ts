import { startWebCamera, stopWebCamera, type WebCamera } from "./camera";
import { createDetector } from "./backends/create-detector";
import { runDetectionLoop } from "./detection-loop";
import { InventoryManager } from "./inventory-state";
import { ScanGuideAgent, type GuideEvent } from "./guide/scan-guide-agent";
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
    guide: null,
  };
}

export function createWebScanner(options?: WebScannerOptions): WebScanner {
  const confidenceThreshold = options?.confidenceThreshold ?? 0.5;
  const fps = options?.fps ?? 30;

  let detector: IWebDetector | null = null;
  let camera: WebCamera | null = null;
  let stopLoop: (() => void) | null = null;
  let session = emptySession();
  let onUpdate: ((s: ScannerSession) => void) | null = null;

  const inventory = new InventoryManager();
  const guide = new ScanGuideAgent();
  let lastConfirmedCount = 0;

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
      session = { ...session, guide: guide.onInit() };
      emit();
    },

    async startCamera(container: HTMLElement): Promise<void> {
      if (!detector) throw new Error("Scanner not initialized");
      camera = await startWebCamera(container);
      session = { ...session, status: "scanning" };
      emit();
    },

    startScanning(callback: (s: ScannerSession) => void): void {
      if (!detector || !camera) throw new Error("Camera not started");

      onUpdate = callback;

      stopLoop = runDetectionLoop(detector, camera.video, fps, (raw) => {
        const { active, newConfirmations } = inventory.processFrame(
          raw,
          performance.now(),
        );

        // Feed new confirmations to guide agent
        let guideEvent: GuideEvent | undefined;
        if (newConfirmations.length > 0) {
          for (const item of newConfirmations) {
            guideEvent = guide.onItemConfirmed(
              item.inventoryLabel,
              item.class,
              item.volumeCuFt,
            );
          }
        }

        session = {
          ...session,
          detections: active,
          confirmedItems: inventory.confirmedItems,
          totalCuFt: inventory.confirmedItems.reduce(
            (sum, item) => sum + item.volumeCuFt,
            0,
          ),
          roomSummary: inventory.getRoomSummary(),
          guide: guideEvent ?? session.guide,
        };
        lastConfirmedCount = inventory.confirmedItems.length;
        emit();
      });
    },

    setRoom(room: string): void {
      inventory.setRoom(room);
      session = { ...session, guide: guide.onRoomChange(room) };
      emit();
    },

    /** Mark current room as done — guide will suggest next room */
    markRoomDone(): void {
      session = { ...session, guide: guide.onRoomDone() };
      emit();
    },

    /** Get guide to remind user to keep scanning */
    nudgeGuide(): void {
      session = { ...session, guide: guide.onIdleTick() };
      emit();
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
      guide.reset();
      inventory.reset();
      session = emptySession();
      onUpdate = null;
    },
  };
}
