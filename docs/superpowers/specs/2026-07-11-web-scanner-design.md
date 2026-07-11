# Web Scanner — Multi-Model Design Spec

**Date:** 2026-07-11  
**Status:** Approved  
**Surfaces:** Expo web (`apps/mobile`), Next.js (`movers.helpkilo/app/scan`)  
**Shared module:** `movers.help/lib/scanner-web/`

## Goal

Build a browser-based furniture scanner that uses multiple models cooperatively: one for object detection, one for depth/volume sizing, spatial memory to prevent double-counting and map rooms, and a conversational guide for walkthrough, packing, and bulky-item fees. Ship incrementally in five phases; Phase 1 is the implementation entry point.

## Problem

The current web scanner does not work:

1. `ScanScreen.tsx` skips camera on web (dark placeholder only).
2. `MediaPipeDetector` expects base64 JPEG but receives raw `Uint8Array`.
3. No `<video>` element exists for frame capture on web.
4. Detection falls back to `SimulatedDetector` with fake boxes.

The mobile pipeline (`SpatialTracker`, `DuplicateGuard`, `RoomMapper`) exists but is not ported to web. `ScanHUD` uses static prompt strings, not a real guide agent.

## Architecture

### Four cooperating layers

| Layer | Responsibility | Technology |
|-------|----------------|-------------|
| **1. Detection** | Identify furniture class + bounding box | MediaPipe EfficientDet (`detectForVideo`) |
| **2. Geometry** | Estimate physical size → cubic feet | TF.js depth model (MiDaS) + bbox math; COCO-SSD as detection-only fallback if MediaPipe fails |
| **3. Spatial memory** | Track items across frames, deduplicate, assign rooms, build house layout | Port `SpatialTracker`, `DuplicateGuard`, `RoomMapper` from `apps/mobile/src/spatial/` |
| **4. Scan guide** | Walk customer through scan; packing/bulky prompts | Scripted TTS (Phase 4); LLM + STT deferred to Phase 5 |

MediaPipe and TF.js run **together** on each frame — not as interchangeable fallbacks. MediaPipe answers *what*; TF.js depth answers *how big*. TF.js COCO-SSD only activates when MediaPipe initialization fails.

### Pipeline (per frame)

```
Camera <video>
  → MediaPipe detectForVideo()     → class, confidence, bbox
  → TF.js MiDaS depth (Phase 3)    → depth map at bbox center
  → SpatialTracker (IoU)           → stable tracking IDs
  → DuplicateGuard (3D position)   → skip re-counts
  → VolumeCalculator               → cu ft (depth+bbox or lookup fallback)
  → RoomMapper                     → room assignment
  → InventoryState                 → confirmed session items
  → ScanGuideAgent                 → TTS prompts + fee cards
  → UI overlay
```

### Module layout

```
lib/scanner-web/
├── index.ts
├── types.ts
├── camera.ts
├── orchestrator.ts
├── inventory-state.ts
├── detection-loop.ts
├── label-map.ts
├── backends/
│   ├── types.ts
│   ├── mediapipe-detector.ts
│   ├── tfjs-detector.ts          # detection fallback only
│   ├── tfjs-depth-estimator.ts   # Phase 3
│   └── create-detector.ts
├── spatial/
│   ├── spatial-tracker.ts
│   ├── duplicate-guard.ts
│   └── room-mapper.ts
├── geometry/
│   └── volume-calculator.ts      # Phase 3
└── guide/
    ├── scan-guide-agent.ts       # Phase 4
    ├── prompts.ts
    ├── bulky-rules.ts
    └── speech.ts
```

### UI shells (not shared)

| Shell | Path | Renders |
|-------|------|---------|
| Expo web | `apps/mobile/src/screens/WebScannerShell.tsx` | DOM `<video>` + bbox overlay |
| Next.js | `movers.helpkilo/app/scan/page.tsx` | Same detection via shared module |

Both import from `lib/scanner-web/`. Expo Metro already watches `movers.help/lib/`. Kilo adds tsconfig path: `"@movers/scanner-web": ["../movers.help/lib/scanner-web"]`.

### Public API

```typescript
export interface WebDetection {
  trackingId: number;
  class: string;
  inventoryLabel: string;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number }; // normalized 0-1
  volumeCuFt: number;
  room: string | null;
  confirmed: boolean;
}

export interface ScannerSession {
  id: string;
  status: "idle" | "loading" | "scanning" | "complete";
  backend: "mediapipe" | "tfjs" | "simulated";
  detections: WebDetection[];
  confirmedItems: WebDetection[];
  totalCuFt: number;
  roomSummary: { room: string; itemCount: number; cuFt: number }[];
}

export function createWebScanner(options?: {
  confidenceThreshold?: number;  // default 0.5
  fps?: number;                  // default 5
}): WebScanner;

export interface WebScanner {
  initialize(): Promise<void>;
  startCamera(container: HTMLElement): Promise<void>;
  startScanning(onUpdate: (session: ScannerSession) => void): void;
  setRoom(room: string): void;
  stopScanning(): void;
  dispose(): void;
}
```

## Phased delivery

### Phase 1 — Detection POC (entry point)

- `getUserMedia` camera in Chrome desktop
- MediaPipe `detectForVideo()` on `<video>` element
- Live bounding boxes with COCO labels mapped via `COCO_TO_INVENTORY`
- Backend badge: `LIVE: mediapipe` | `LIVE: tfjs` | `SIMULATED`
- Shared module + thin shells on Expo web and `/scan`
- 5 FPS detection loop; pause when tab hidden

**Out of scope for Phase 1:** cu ft counter polish, truck link, room mapper UI, TTS, depth model.

### Phase 2 — Spatial memory

- Port `SpatialTracker`, `DuplicateGuard`, `RoomMapper` to `lib/scanner-web/spatial/`
- Manual room picker in UI (web has no gyro)
- Running `InventoryState` with confirmed items
- Room summary panel (house layout view)
- Same couch from two angles counted once

### Phase 3 — Volume sizing

- TF.js MiDaS depth estimation on video frames
- `volume-calculator.ts`: bbox pixel size + depth → approximate W×H×D in feet
- Fallback to `getCuFt(inventoryLabel)` when depth confidence < 0.4
- Live cu ft counter in HUD

### Phase 4 — Scan guide

- `scan-guide-agent.ts` state machine driven by inventory events
- `bulky-rules.ts`: TV, mirror, piano, art, plant, safe → fee prompts
- Web Speech API TTS for walkthrough prompts
- On-screen cards for packing questions (e.g. "Do you have the original TV box?")

### Phase 5 — Conversational (deferred)

- LLM API for dynamic follow-ups
- Web Speech STT for voice answers
- Not in initial implementation plan

## Error handling

| Failure | User experience | System behavior |
|---------|-----------------|-----------------|
| Camera denied | Permission gate with retry | Stop loop |
| Not HTTPS | Warning message | Block camera (localhost exempt) |
| MediaPipe CDN fail | Brief "Switching detector…" | Auto-fallback to TF.js COCO-SSD |
| TF.js fail | Orange `SIMULATED` badge | `SimulatedDetector` |
| Model load > 10s | Timeout message + fallback | Try next backend |
| Zero detections | Empty overlay | Continue loop |
| Tab backgrounded | Loop pauses | Resume on `visibilitychange` |

## Dependencies

| Package | movers.help mobile | movers.helpkilo |
|---------|-------------------|-----------------|
| `@mediapipe/tasks-vision` | exists | add |
| `@tensorflow/tfjs` | add | add |
| `@tensorflow-models/coco-ssd` | add | add |
| `@tensorflow-models/midas` or depth equivalent | Phase 3 | Phase 3 |

CDN URLs (Phase 1):

- WASM: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
- Model: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`

## Label normalization

`label-map.ts` normalizes backend output:

1. Lowercase
2. Replace `_` with space
3. Lookup `COCO_TO_INVENTORY` from `lib/truckConfig.ts`
4. Fallback: title-case raw class name

## Bulky item rules (Phase 4)

```typescript
const BULKY_CLASSES = ["tv", "piano", "mirror", "art", "plant", "safe"];
const BULKY_FEES: Record<string, number> = {
  tv: 75,
  mirror: 45,
  piano: 150,
};
```

Guide agent fires prompts when confirmed item class matches `BULKY_CLASSES`.

## Testing

### Phase 1

- [ ] Camera works on `localhost` (Expo web + kilo `/scan`)
- [ ] MediaPipe loads < 10s; badge shows `LIVE: mediapipe`
- [ ] Couch/chair/TV produces bbox within 2s
- [ ] Tab pause/resume works

### Phase 2

- [ ] Duplicate couch from two angles → one inventory entry
- [ ] Room picker assigns items correctly
- [ ] Room summary accurate

### Phase 3

- [ ] Cu ft within ±30% of lookup table for known items
- [ ] Depth fallback when confidence low

### Phase 4

- [ ] TTS speaks on scan start, item confirm, room transition
- [ ] TV triggers bulky fee prompt

## Global constraints

- **Browser:** Chrome desktop for POC; Safari/mobile deferred
- **FPS:** 5 default (Phase 1); configurable
- **Confidence threshold:** 0.5 default
- **Tracker:** IoU 0.3, minConfirmations 2, maxMissedFrames 5 (match mobile defaults)
- **DuplicateGuard:** spatialRadius 0.5m, classMatchRequired true
- **Privacy copy:** "Everything processed on-device. No video leaves your phone."
- **No truck link in Phase 1** — deferred to post-POC integration with existing `getTruckUrl()`

## Files touched (summary)

| Action | Path |
|--------|------|
| Create | `lib/scanner-web/**` |
| Create | `apps/mobile/src/screens/WebScannerShell.tsx` |
| Modify | `apps/mobile/src/screens/ScanScreen.tsx` (web branch) |
| Create | `movers.helpkilo/app/scan/page.tsx` |
| Modify | `movers.helpkilo/tsconfig.json` (path alias) |
| Modify | `movers.helpkilo/package.json` (deps) |
| Modify | `movers.helpkilo/components/layouts/nav.tsx` (link) |

