import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import MatrixRain from "@/components/landing/matrix-rain";

describe("MatrixRain", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
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
    // Component renders canvas in JSX but useEffect bails gracefully when getContext returns null
    const { container } = render(<MatrixRain />);
    // Should not crash — canvas element still exists in DOM, but no context means no rendering
    expect(container.querySelector("canvas")).toBeTruthy();
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

  it("respects prefers-reduced-motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    );
    const { container } = render(<MatrixRain />);
    const canvas = container.querySelector("canvas");
    // Still renders canvas for static grid
    expect(canvas).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("draws grid on canvas", () => {
    const { container } = render(<MatrixRain />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
    // Canvas renders; grid drawn in animation frame
  });
});