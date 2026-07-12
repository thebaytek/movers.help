"use client";

import { useEffect, useRef } from "react";

type Raindrop = {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
  brightness: number;
  active: boolean;
};

type Glow = {
  x: number;
  y: number;
  alpha: number;
};

const GRID_SIZE = 20;
const GRID_COLOR = "rgba(118, 255, 3, 0.03)";
const FONT_SIZE = 8;
const COL_GAP = 18;
const MAX_DROPS = 200;
const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const GLOW_RADIUS = 1.5;
const GLOW_DECAY = 0.05;
const GLOW_INITIAL = 0.3;

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

function generateChain(length: number): string[] {
  return Array.from({ length }, () => randomChar());
}

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only render in dark mode (future-proof)
    if (!document.documentElement.classList.contains("dark")) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Particle pool
    const drops: Raindrop[] = [];
    const columnCooldowns: number[] = [];
    const glows: Glow[] = [];

    const initParticles = () => {
      drops.length = 0;
      const numColumns = Math.floor(canvas.width / COL_GAP);
      columnCooldowns.length = numColumns;
      for (let i = 0; i < numColumns; i++) {
        columnCooldowns[i] = Math.floor(Math.random() * 60);
      }
      for (let i = 0; i < MAX_DROPS; i++) {
        drops.push({
          x: 0,
          y: 0,
          speed: 0,
          chars: [],
          length: 0,
          brightness: 0,
          active: false,
        });
      }
    };

    const spawnDrop = (colIndex: number) => {
      const drop = drops.find((d) => !d.active);
      if (!drop) return;
      drop.x = colIndex * COL_GAP;
      drop.y = -(Math.random() * 400);
      drop.speed = 1.5 + Math.random() * 2.5;
      drop.length = 8 + Math.floor(Math.random() * 13);
      drop.chars = generateChain(drop.length);
      drop.brightness = 0.2 + Math.random() * 0.3;
      drop.active = true;
    };

    const updateRain = () => {
      for (let i = 0; i < columnCooldowns.length; i++) {
        columnCooldowns[i]--;
        if (columnCooldowns[i] <= 0) {
          spawnDrop(i);
          columnCooldowns[i] = 30 + Math.floor(Math.random() * 90);
        }
      }
    };

    const drawGrid = () => {
      if (!ctx) return;
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawGlows = () => {
      if (!ctx) return;
      for (let i = glows.length - 1; i >= 0; i--) {
        const g = glows[i];
        if (g.alpha <= 0) {
          glows.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.shadowColor = `rgba(118, 255, 3, ${g.alpha})`;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(118, 255, 3, ${g.alpha})`;
        ctx.beginPath();
        ctx.arc(g.x, g.y, GLOW_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        g.alpha -= GLOW_DECAY;
      }
    };

    const drawRain = () => {
      if (!ctx) return;
      ctx.font = `${FONT_SIZE}px monospace`;

      for (const drop of drops) {
        if (!drop.active) continue;

        for (let ci = 0; ci < drop.length; ci++) {
          const charY = drop.y + ci * FONT_SIZE;
          if (charY < -FONT_SIZE || charY > canvas.height + FONT_SIZE) continue;

          if (ci === 0) {
            ctx.fillStyle = `rgba(180, 255, 180, ${0.7 + drop.brightness * 0.3})`;
          } else {
            const fade = 1 - ci / drop.length;
            ctx.fillStyle = `rgba(118, 255, 3, ${fade * drop.brightness})`;
          }
          ctx.fillText(drop.chars[ci], drop.x, charY);
        }

        // Check for grid-line crossing
        const prevY = drop.y;
        drop.y += drop.speed;
        const nextGridY = Math.ceil(drop.y / GRID_SIZE) * GRID_SIZE;
        const prevGridY = Math.ceil(prevY / GRID_SIZE) * GRID_SIZE;
        if (
          nextGridY !== prevGridY &&
          drop.y > 0 &&
          drop.y < canvas.height
        ) {
          glows.push({ x: drop.x, y: nextGridY, alpha: GLOW_INITIAL });
        }

        if (drop.y > canvas.height + drop.length * FONT_SIZE) {
          drop.active = false;
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    resize();
    window.addEventListener("resize", resize);

    let animating = true;

    const render = () => {
      if (!animating) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();

      if (!prefersReducedMotion) {
        updateRain();
        drawGlows();
        drawRain();
      }

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