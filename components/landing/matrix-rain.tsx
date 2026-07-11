"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only render in dark mode (future-proof: if light mode is added, rain won't show)
    if (!document.documentElement.classList.contains("dark")) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    let animating = true;

    const render = () => {
      if (!animating) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    return () => {
      animating = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}