import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startWebCamera, stopWebCamera } from "../camera";

/**
 * jsdom has no real media pipeline, so we stub the pieces of
 * HTMLMediaElement that startWebCamera() relies on.
 */
const realPrototype = {
  readyState: Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    "readyState",
  ),
  srcObject: Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    "srcObject",
  ),
  play: Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "play"),
};

beforeEach(() => {
  // readyState 0 (HAVE_NOTHING) by default — like a freshly created <video>
  Object.defineProperty(HTMLMediaElement.prototype, "readyState", {
    configurable: true,
    get: () => 0,
  });
  Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
    configurable: true,
    get() {
      return (this as HTMLMediaElement & { __src: unknown }).__src ?? null;
    },
    set(v: unknown) {
      (this as HTMLMediaElement & { __src: unknown }).__src = v;
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });
});

afterEach(() => {
  for (const [name, desc] of Object.entries(realPrototype)) {
    if (desc) {
      Object.defineProperty(HTMLMediaElement.prototype, name, desc);
    }
  }
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: undefined,
  });
});

async function videoInContainer(container: HTMLElement): Promise<HTMLVideoElement> {
  await vi.waitFor(() => {
    const v = container.querySelector("video");
    if (!v) throw new Error("video element not created yet");
  });
  return container.querySelector("video")!;
}

describe("startWebCamera", () => {
  it("throws a clear error when getUserMedia is unavailable", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    const container = document.createElement("div");
    await expect(startWebCamera(container)).rejects.toThrow(
      "Camera not supported",
    );
  });

  it("resolves immediately (race-safe) when frames are already buffered", async () => {
    // Simulate a fast stream where `loadeddata` fires before the handler attaches
    Object.defineProperty(HTMLMediaElement.prototype, "readyState", {
      configurable: true,
      get: () => 4, // HAVE_ENOUGH_DATA
    });

    const container = document.createElement("div");
    const cam = await startWebCamera(container);
    expect(container.querySelector("video")).not.toBeNull();
    expect(cam.video).toBe(container.querySelector("video"));
    cam.stop();
  });

  it("waits for loadeddata when the stream is still buffering", async () => {
    const container = document.createElement("div");
    const promise = startWebCamera(container);

    const video = await videoInContainer(container);
    // Fire the event the code is waiting on
    video.onloadeddata?.(new Event("loadeddata"));

    const cam = await promise;
    expect(cam.video).toBe(video);
    cam.stop();
  });

  it("rejects with a clear error when the video errors out", async () => {
    const container = document.createElement("div");
    const promise = startWebCamera(container);

    const video = await videoInContainer(container);
    video.onerror?.(new Event("error"));

    await expect(promise).rejects.toThrow("Video failed to load");
  });

  it("appends the video to the given container and stop() cleans up", async () => {
    const container = document.createElement("div");
    const promise = startWebCamera(container);
    const video = await videoInContainer(container);
    video.onloadeddata?.(new Event("loadeddata"));
    const cam = await promise;
    expect(container.contains(cam.video)).toBe(true);

    const stopTrack = vi.fn();
    const tracks = [{ stop: stopTrack }] as unknown as MediaStreamTrack[];
    cam.stream.getTracks = () => tracks;
    stopWebCamera(cam);

    expect(stopTrack).toHaveBeenCalledTimes(1);
    expect(container.contains(cam.video)).toBe(false);
  });
});
