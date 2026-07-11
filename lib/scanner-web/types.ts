export interface NormalizedBbox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RawDetection {
  class: string;
  confidence: number;
  bbox: NormalizedBbox;
}

export type DetectorBackend = "mediapipe" | "tfjs" | "simulated";

export interface IWebDetector {
  readonly backend: DetectorBackend;
  initialize(): Promise<void>;
  detect(video: HTMLVideoElement, timestampMs: number): Promise<RawDetection[]>;
  dispose(): void;
}

export interface WebDetection {
  trackingId: number;
  class: string;
  inventoryLabel: string;
  confidence: number;
  bbox: NormalizedBbox;
  volumeCuFt: number;
  room: string | null;
  confirmed: boolean;
}

export type ScannerStatus = "idle" | "loading" | "scanning" | "complete";

export interface RoomSummary {
  room: string;
  itemCount: number;
  cuFt: number;
}

export interface ScannerSession {
  id: string;
  status: ScannerStatus;
  backend: DetectorBackend;
  detections: WebDetection[];
  confirmedItems: WebDetection[];
  totalCuFt: number;
  roomSummary: RoomSummary[];
  guide: import("./guide/scan-guide-agent").GuideEvent | null;
}

export interface WebScannerOptions {
  confidenceThreshold?: number;
  fps?: number;
}

export interface WebScanner {
  initialize(): Promise<void>;
  startCamera(container: HTMLElement): Promise<void>;
  startScanning(onUpdate: (session: ScannerSession) => void): void;
  setRoom(room: string): void;
  /** Mark current room as done — guide suggests next room */
  markRoomDone(): void;
  /** Nudge guide to remind user to keep scanning */
  nudgeGuide(): void;
  stopScanning(): void;
  dispose(): void;
}
