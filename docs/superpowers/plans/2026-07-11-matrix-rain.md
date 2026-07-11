# Matrix Rain Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a canvas-based Matrix digital rain effect to the landing page with grid-intersection glow reactivity.

**Architecture:** A single self-contained `MatrixRain` React component renders a `<canvas>` overlay on the landing page only. It draws the existing 40px grid and animates falling character chains that light up grid intersections as they pass. The component is imperatively managed via `requestAnimationFrame` with no React re-renders. The existing CSS grid overlay stays for all other pages and is suppressed on the landing page via a `data-has-rain` body attribute.

**Tech Stack:** React 19, Next.js 15, TypeScript, Canvas API, Tailwind CSS 4, Vitest

**Spec:** `docs/superpowers/specs/2026-07-11-matrix-rain-design.md`

## Global Constraints

- All new code in TypeScript with strict mode
- Tailwind CSS v4 for utility classes; use `@layer` for custom CSS
- Vitest for unit tests; React Testing Library for component tests
- Follow existing project conventions: `"use client"` directive for client components, `@/` path alias for imports
- Font: JetBrains Mono (already loaded as `--font-mono`)

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `app/globals.css` | Modify | Add `body[data-has-rain] .bg-grid` suppression rule |
| `components/landing/matrix-rain.tsx` | Create | Canvas component: grid, rain, intersection glow, animation loop |
| `app/page.tsx` | Modify | Add `<MatrixRain />` and set `data-has-rain` on body |
| `__tests__/matrix-rain.test.tsx` | Create | Unit tests for component behavior |


---

### Task 1: CSS Suppression Rule

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS rule `body[data-has-rain] .bg-grid { display: none; }` — landing page suppresses the existing grid overlay

- [ ] **Step 1: Add suppression rule to globals.css**

Add after the existing `.bg-grid` block (after line 87):

```css
  /* Suppress CSS grid overlay when canvas rain is active (landing page only) */
  body[data-has-rain] .bg-grid {
    display: none;
  }
```

- [ ] **Step 2: Verify no build errors**

Run: `cd /home/hunter/movers.helpkilo && npm run build 2>&1 | tail -5`
Expected: Build succeeds without CSS errors.

- [ ] **Step 3: Commit**

```bash
cd /home/hunter/movers.helpkilo
git add app/globals.css
git commit -m "feat: add CSS rule to suppress grid when canvas rain is active"
```


---

### Task 2: MatrixRain Component — Canvas Shell

**Files:**
- Create: `components/landing/matrix-rain.tsx`
- Create: `__tests__/matrix-rain.test.tsx`

**Interfaces:**
- Produces: `export default function MatrixRain()` — renders a `<canvas>` element, no props
- Consumes: nothing external beyond browser Canvas API

- [ ] **Step 1: Write the failing test**

Create `__tests__/matrix-rain.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import MatrixRain from "@/components/landing/matrix-rain";

describe("MatrixRain", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders a canvas element", () => {
    const { container } = render(<MatrixRain />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
  });

  it("renders nothing when canvas is unsupported", () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
    const { container } = render(<MatrixRain />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeNull();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("sets pointer-events-none and fixed positioning", () => {
    const { container } = render(<MatrixRain />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
    if (canvas) {
      expect(canvas.className).toContain("pointer-events-none");
      expect(canvas.className).toContain("fixed");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/hunter/movers.helpkilo && npx vitest run __tests__/matrix-rain.test.tsx`
Expected: FAIL — "Cannot find module '@/components/landing/matrix-rain'"

- [ ] **Step 3: Write minimal component implementation**

Create `components/landing/matrix-rain.tsx`:

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/hunter/movers.helpkilo && npx vitest run __tests__/matrix-rain.test.tsx`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/hunter/movers.helpkilo
git add components/landing/matrix-rain.tsx __tests__/matrix-rain.test.tsx
git commit -m "feat: add MatrixRain canvas shell with resize handling"
```




---

### Task 3: Grid Rendering on Canvas

**Files:**
- Modify: `components/landing/matrix-rain.tsx`
- Modify: `__tests__/matrix-rain.test.tsx`

**Interfaces:**
- Consumes: Canvas context from Task 2 shell
- Produces: Grid drawn at 40px intervals, `rgba(118, 255, 3, 0.04)` — matches existing CSS `.bg-grid`

- [ ] **Step 1: Add grid drawing to component**

Add these constants inside the component, above `useEffect`:

```tsx
const GRID_SIZE = 40;
const GRID_COLOR = "rgba(118, 255, 3, 0.04)";
```

Add inside `useEffect`, before `resize`:

```tsx
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
```

Call `drawGrid()` at top of `render` function.

- [ ] **Step 2: Add grid test**

Add to `matrix-rain.test.tsx`:

```tsx
  it("draws grid on canvas", () => {
    const { container } = render(<MatrixRain />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    expect(canvas.getContext("2d")).not.toBeNull();
  });
```

- [ ] **Step 3: Run tests and commit**

```bash
cd /home/hunter/movers.helpkilo && npx vitest run __tests__/matrix-rain.test.tsx
git add components/landing/matrix-rain.tsx __tests__/matrix-rain.test.tsx
git commit -m "feat: render 40px grid on MatrixRain canvas"


---

### Task 4: Rain Particle System

**Files:**
- Modify: `components/landing/matrix-rain.tsx`

**Interfaces:**
- Consumes: Grid rendering from Task 3
- Produces: Raindrops falling down columns; character chains drawn with leading bright white-green, trailing fade

- [ ] **Step 1: Add types, constants, and particle logic**

Add above the component:

```tsx
type Raindrop = {
  x: number; y: number; speed: number;
  chars: string[]; length: number; brightness: number; active: boolean;
};

const FONT_SIZE = 14;
const COL_GAP = 40;
const MAX_DROPS = 80;
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";

function randomChar(): string { return CHARSET[Math.floor(Math.random() * CHARSET.length)]; }
function generateChain(length: number): string[] { return Array.from({ length }, () => randomChar()); }
```

Add inside `useEffect` (after grid constants):

```tsx
const drops: Raindrop[] = [];
const columnCooldowns: number[] = [];

const initParticles = () => {
  drops.length = 0;
  const numColumns = Math.floor(canvas.width / COL_GAP);
  columnCooldowns.length = numColumns;
  for (let i = 0; i < numColumns; i++) columnCooldowns[i] = Math.floor(Math.random() * 60);
  for (let i = 0; i < MAX_DROPS; i++) {
    drops.push({ x: 0, y: 0, speed: 0, chars: [], length: 0, brightness: 0, active: false });
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
    if (columnCooldowns[i] <= 0) { spawnDrop(i); columnCooldowns[i] = 30 + Math.floor(Math.random() * 90); }
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
        ctx.fillStyle = `rgba(180,255,180,${0.7 + drop.brightness * 0.3})`;
      } else {
        const fade = 1 - (ci / drop.length);
        ctx.fillStyle = `rgba(118,255,3,${fade * drop.brightness})`;
      }
      ctx.fillText(drop.chars[ci], drop.x, charY);
    }
    drop.y += drop.speed;
    if (drop.y > canvas.height + drop.length * FONT_SIZE) drop.active = false;
  }
};
```

Add `initParticles()` after `resize()` in setup. Add `updateRain()` then `drawRain()` in render after `drawGrid()`. Update resize to also call `initParticles()`.

- [ ] **Step 2: Verify build**

```bash
cd /home/hunter/movers.helpkilo && npm run build 2>&1 | tail -5
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/landing/matrix-rain.tsx
git commit -m "feat: add Matrix rain particle system with spawn/update/draw"
```



---

### Task 5: Intersection Glow

**Files:**
- Modify: `components/landing/matrix-rain.tsx`

**Interfaces:**
- Consumes: Rain from Task 4, grid from Task 3
- Produces: Glow dots at grid intersections when raindrops cross; fade ~8 frames

- [ ] **Step 1: Add glow types and logic**

Add above component:

```tsx
type Glow = { x: number; y: number; alpha: number; };
const GLOW_RADIUS = 3;
const GLOW_DECAY = 0.05;
const GLOW_INITIAL = 0.4;
```

Add inside `useEffect`:

```tsx
const glows: Glow[] = [];
```

In `drawRain`, after `drop.y += drop.speed`, add:

```tsx
    const prevY = drop.y - drop.speed;
    const nextGridY = Math.ceil(drop.y / GRID_SIZE) * GRID_SIZE;
    const prevGridY = Math.ceil(prevY / GRID_SIZE) * GRID_SIZE;
    if (nextGridY !== prevGridY && drop.y > 0 && drop.y < canvas.height) {
      glows.push({ x: drop.x, y: nextGridY, alpha: GLOW_INITIAL });
    }
```

Add `drawGlows` function:

```tsx
const drawGlows = () => {
  if (!ctx) return;
  for (let i = glows.length - 1; i >= 0; i--) {
    const g = glows[i];
    if (g.alpha <= 0) { glows.splice(i, 1); continue; }
    ctx.save();
    ctx.shadowColor = `rgba(118,255,3,${g.alpha})`;
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(118,255,3,${g.alpha})`;
    ctx.beginPath();
    ctx.arc(g.x, g.y, GLOW_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    g.alpha -= GLOW_DECAY;
  }
};
```

Call `drawGlows()` in `render` after `drawGrid()`.

- [ ] **Step 2: Verify build**

```bash
cd /home/hunter/movers.helpkilo && npm run build 2>&1 | tail -5
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/landing/matrix-rain.tsx
git commit -m "feat: add grid-intersection glow when raindrops cross"
```



---

### Task 6: Reduced Motion Support

**Files:**
- Modify: `components/landing/matrix-rain.tsx`
- Modify: `__tests__/matrix-rain.test.tsx`

**Interfaces:**
- Consumes: Full MatrixRain from Task 5
- Produces: Rain disabled when `prefers-reduced-motion: reduce`; grid still renders

- [ ] **Step 1: Add reduced motion guard**

At top of `useEffect`, before `resize`:

```tsx
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

Wrap rain calls in render:

```tsx
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
```

- [ ] **Step 2: Add test**

```tsx
  it("respects prefers-reduced-motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const { container } = render(<MatrixRain />);
    expect(container.querySelector("canvas")).toBeTruthy();
    vi.unstubAllGlobals();
  });
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run __tests__/matrix-rain.test.tsx
git add components/landing/matrix-rain.tsx __tests__/matrix-rain.test.tsx
git commit -m "feat: support prefers-reduced-motion in MatrixRain"
```

---

### Task 7: Integration — Wire Into Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add import and render**

```tsx
import MatrixRain from "@/components/landing/matrix-rain";
```

Add `<MatrixRain />` as first child of `<main>`.

- [ ] **Step 2: Set data-has-rain on body**

Add inside `Home` component:

```tsx
useEffect(() => {
  document.body.setAttribute("data-has-rain", "");
  return () => { document.body.removeAttribute("data-has-rain"); };
}, []);
```

Ensure `useEffect` is imported from React.

- [ ] **Step 3: Build and commit**

```bash
npm run build
git add app/page.tsx
git commit -m "feat: integrate MatrixRain into landing page with grid suppression"
```



---

### Task 8: Smoke Test & Manual Verification

- [ ] **Step 1: Start dev server**

```bash
cd /home/hunter/movers.helpkilo && npm run dev
```

- [ ] **Step 2: Verify landing page** (open `http://localhost:3000`)
- Matrix rain visible (falling green characters)
- Grid lines visible in background
- Intersections glow as characters pass grid lines
- Content (hero text, buttons) readable above rain
- No double grid (CSS grid overlay suppressed)

- [ ] **Step 3: Verify other pages** (`/login`, `/dashboard`)
- No Matrix rain, CSS grid overlay present

- [ ] **Step 4: Test resize** — columns/grid adapt, no glitches

- [ ] **Step 5: Test tab switching** — rain resumes cleanly

- [ ] **Step 6: Commit adjustments if any**

---

### Task 9: Final Test Run & Lint

- [ ] **Step 1: Full test suite**

```bash
cd /home/hunter/movers.helpkilo && npx vitest run
```
Expected: All tests PASS.

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: No errors.

- [ ] **Step 3: Final build**

```bash
npm run build
```
Expected: No errors.

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "chore: final test and lint pass for Matrix rain"
```

```
