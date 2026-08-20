export interface WebCamera {
  video: HTMLVideoElement;
  stream: MediaStream;
  stop(): void;
}

export async function startWebCamera(
  container: HTMLElement,
  options?: { facingMode?: "user" | "environment"; width?: number },
): Promise<WebCamera> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera not supported. Use HTTPS or localhost.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: options?.facingMode ?? "environment",
      width: { ideal: options?.width ?? 640 },
    },
    audio: false,
  });

  const video = document.createElement("video");
  video.setAttribute("playsinline", "true");
  video.setAttribute("autoplay", "true");
  video.muted = true;
  video.style.width = "100%";
  video.style.height = "100%";
  video.style.objectFit = "cover";
  video.srcObject = stream;
  container.appendChild(video);

  // Race-safe load: if frames are already available the `loadeddata` event
  // may have fired before the handler was attached, so check readyState first.
  // A hard timeout guarantees we never hang the scan page on a dead stream.
  await new Promise<void>((resolve, reject) => {
    if (video.readyState >= 2) {
      resolve();
      return;
    }
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (fn: () => void) => () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      fn();
    };
    timer = setTimeout(
      finish(() => reject(new Error("Video stream timed out while loading"))),
      10_000,
    );
    video.onloadeddata = finish(resolve);
    video.onerror = finish(() => reject(new Error("Video failed to load")));
  });

  // Muted video should autoplay, but some browsers reject play() in edge
  // cases — the element is already in the DOM, so don't fail the whole scan.
  try {
    await video.play();
  } catch {
    // continue; frames advance as soon as the browser allows playback
  }

  return {
    video,
    stream,
    stop: () => {
      stream.getTracks().forEach((t) => t.stop());
      video.remove();
    },
  };
}

export function stopWebCamera(camera: WebCamera): void {
  camera.stop();
}
