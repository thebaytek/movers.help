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

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Video failed to load"));
  });
  await video.play();

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
