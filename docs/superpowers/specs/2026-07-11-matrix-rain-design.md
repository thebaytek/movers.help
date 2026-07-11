# Matrix Rain Landing Page — Design Spec

**Date:** 2026-07-11
**Status:** Approved
**Project:** movers.helpkilo

## Overview

Add a Matrix-style digital rain effect to the landing page (`/`), combining falling green character chains with the existing 40px CSS grid. Raindrops light up grid intersections as they pass through them, creating a reactive, Tron-meets-Matrix visual. The rain is canvas-rendered for performance and replaces the CSS grid overlay on the landing page only.

## Scope

- **In scope:** Landing page (`/`) only. A single self-contained `<MatrixRain />` canvas component.
- **Out of scope:** Other pages (dashboard, auth, scan, etc.) — they keep the existing CSS grid overlay unchanged.

## Architecture

### New Component: `MatrixRain`

**File:** `components/landing/matrix-rain.tsx`

A `"use client"` React component that owns a `<canvas>` element. Takes no props — fully self-contained. Renders as a fixed overlay behind all content.

**Mount lifecycle:**
1. Size canvas to viewport
2. Attach `ResizeObserver` for responsive resizing
3. Initialize raindrop particle pool (pre-allocated array, max 80 columns)
4. Start `requestAnimationFrame` render loop
5. Cleanup on unmount: cancel frame, disconnect observer

### Integration

- `<MatrixRain />` is added inside `page.tsx` as the first child of `<main>`, positioned `fixed inset-0 z-0 pointer-events-none`.
- The existing `<div className="fixed inset-0 z-0 pointer-events-none bg-grid scan-line-overlay">` in `layout.tsx` is suppressed on the landing page via a `data-has-rain` attribute on `<body>`.
- `globals.css` gains: `body[data-has-rain] .bg-grid { display: none; }`.
- `page.tsx` sets `document.body.dataset.hasRain = ""` on mount (via a small useEffect or inline).

## Data Model

### Raindrop Particle

```ts
type Raindrop = {
  x: number;           // pixel position (center of grid column)
  y: number;           // current y-offset (top of character chain)
  speed: number;       // px per frame, randomized 1.5–4
  chars: string[];     // pre-generated chain (katakana, latin, digits)
  length: number;      // chain length in characters, 8–20
  brightness: number;  // alpha wobble, 0.2–0.5
  active: boolean;     // currently falling
};
```

### Intersection Glow

```ts
type Glow = {
  x: number;     // pixel x at grid column
  y: number;     // pixel y at grid row
  alpha: number; // current brightness, decays each frame
};
```

## Render Loop (per frame)

1. **Clear** canvas to transparent
2. **Draw grid** — 40px cells, `rgba(118, 255, 3, 0.04)`, matching current CSS `.bg-grid`
3. **Draw glows** — filled circles at `(glow.x, glow.y)`, radius 3px, `rgba(118, 255, 3, alpha)`, with a CSS `shadowBlur` halo
4. **Draw raindrops** — character chains, top-to-bottom, leading character bright white-green `rgba(180, 255, 180, 0.9)`, trailing characters fading to transparent
5. **Update positions** — advance each drop by `speed`, deactivate if `y > viewportHeight + buffer`
6. **Spawn** — each column has a cooldown (30–120 random frames); spawn when expired
7. **Detect crossings** — if a drop's y crosses a grid line (`y % 40 < speed`), push a new glow at that intersection with `alpha = 0.4`
8. **Decay glows** — reduce all glow alphas by 0.05/frame, remove when ≤ 0

## Performance

- Pre-allocated arrays (no GC churn in the hot loop)
- Monospace `fillText` — GPU-accelerated by browsers
- Max ~1,120 `fillText` calls/frame (80 drops × ~14 chars avg) — well within 60fps budget
- No React re-renders triggered; canvas is imperatively managed
- `requestAnimationFrame` naturally pauses when tab is hidden

## Edge Cases & Error Handling

| Case | Behavior |
|------|----------|
| Canvas not supported (`getContext('2d')` returns null) | Render empty fragment. Page shows no rain, CSS grid remains as fallback on landing page. |
| `prefers-reduced-motion: reduce` | Grid renders (static), rain and intersection glow skipped. Matches existing `globals.css` pattern at line 173. |
| Resize / orientation change | `ResizeObserver` recalculates canvas dimensions. Drops keep x positions (tied to grid columns). No flicker, no restart. |
| Tab hidden / returned | `requestAnimationFrame` pauses naturally. Drops resume from same positions on return. |
| Component unmount | `useEffect` cleanup: cancel animation frame, disconnect `ResizeObserver`. Particle pool/glow arrays GC'd. |
| Light mode added in future | Rain only renders when `<html>` has `.dark` class. If absent, component renders nothing. |

## Dependencies

None new. Uses browser Canvas API only. `framer-motion` remains for other animations but is not used by this component.

## Testing

- **Unit:** Verify component renders nothing when canvas is unsupported (mock `HTMLCanvasElement.prototype.getContext`).
- **Unit:** Verify `prefers-reduced-motion` disables rain animation.
- **Manual:** Landing page loads with rain visible, grid intersections glow on crossing, content remains readable.
- **Manual:** Navigate to `/login`, `/dashboard` — no rain, existing CSS grid intact.
- **Manual:** Resize browser window — rain adapts without visual glitches.
- **Manual:** Switch tabs and return — rain resumes correctly.
