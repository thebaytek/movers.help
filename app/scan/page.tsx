"use client";

import { useEffect, useRef, useState } from "react";
import { createWebScanner, type ScannerSession } from "@/lib/scanner-web";
import { ChevronUp, ChevronDown } from "lucide-react";

const BACKEND_LABELS: Record<string, string> = {
  mediapipe: "LIVE: mediapipe",
  tfjs: "LIVE: tfjs",
  simulated: "SIMULATED",
};

const BACKEND_COLORS: Record<string, string> = {
  mediapipe: "#22D3EE",
  tfjs: "#818CF8",
  simulated: "#F59E0B",
};

export default function ScanPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<ReturnType<typeof createWebScanner> | null>(null);
  const [session, setSession] = useState<ScannerSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRoom] = useState("Living Room");
  const [statsOpen, setStatsOpen] = useState(false);

  // Disable matrix rain / grid on this page for camera clarity and battery
  useEffect(() => {
    document.body.setAttribute("data-scan-page", "true");
    return () => document.body.removeAttribute("data-scan-page");
  }, []);

  // Safety timeout: if loading takes >12s, dispose the scanner and show an error.
  // We use a ref so the main effect can detect the timeout even though the
  // async closure would otherwise capture a stale `error` value.
  const errorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      const msg =
        "Camera initialization timed out. Make sure you're on HTTPS or localhost and have granted camera permission.";
      errorRef.current = msg;
      setError(msg);
      setLoading(false);
      // Stop any still-running model load / camera work so it can't "come
      // alive" silently underneath the error overlay.
      scannerRef.current?.dispose();
      scannerRef.current = null;
    }, 12_000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    const scanner = createWebScanner();
    scannerRef.current = scanner;
    let mounted = true;
    let disposed = false;

    (async () => {
      try {
        await scanner.initialize();
        if (!containerRef.current || !mounted || disposed || errorRef.current) {
          scanner.dispose();
          return;
        }
        await scanner.startCamera(containerRef.current);
        if (!mounted || disposed || errorRef.current) {
          scanner.dispose();
          return;
        }
        scanner.startScanning((s) => {
          if (mounted && !disposed) {
            setSession(s);
            setLoading(false);
          }
        });
        scanner.setRoom("Living Room");
      } catch (e) {
        if (mounted && !disposed && !errorRef.current) {
          errorRef.current = e instanceof Error ? e.message : "Camera failed";
          setError(errorRef.current);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      disposed = true;
      scanner.stopScanning();
      scanner.dispose();
      if (scannerRef.current === scanner) scannerRef.current = null;
    };
  }, []);

  const backend = session?.backend ?? "simulated";
  const badgeColor = BACKEND_COLORS[backend];
  const badgeLabel = BACKEND_LABELS[backend];
  const confirmedCount = session?.confirmedItems.length ?? 0;

  return (
    <main className="relative h-screen min-h-screen bg-surface-950 overflow-hidden select-none">
      {/* Camera container — full screen */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top bar: room + cu ft */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {/* Room pill */}
        <div className="glass px-3 py-1.5 backdrop-blur-md rounded-full flex items-center gap-1.5 min-h-[44px]">
          <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-accent-500 uppercase tracking-wider">
            {currentRoom}
          </span>
        </div>

        {/* Cu ft pill */}
        {session && confirmedCount > 0 && (
          <div className="glass rounded-full px-3 py-1.5 backdrop-blur-md flex items-center gap-1.5 min-h-[44px]">
            <span className="text-[10px] uppercase tracking-wider text-surface-500">Total</span>
            <span className="text-sm font-bold text-accent-500 tabular-nums">
              {session.totalCuFt}
            </span>
            <span className="text-[10px] text-surface-400">cu ft</span>
          </div>
        )}
      </div>

      {/* Bbox overlays */}
      {session?.detections.map((d) => (
        <div
          key={`${d.trackingId}-${d.class}`}
          className="absolute z-10 border-2 rounded pointer-events-none"
          style={{
            left: `${d.bbox.x * 100}%`,
            top: `${d.bbox.y * 100}%`,
            width: `${d.bbox.w * 100}%`,
            height: `${d.bbox.h * 100}%`,
            borderColor: badgeColor,
          }}
        >
          <span
            className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold whitespace-nowrap"
            style={{ backgroundColor: badgeColor, color: "#08080e" }}
          >
            {d.inventoryLabel} · {Math.round(d.confidence * 100)}%
          </span>
        </div>
      ))}

      {/* Loading overlay */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950 z-30 gap-3">
          <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
          <p className="text-surface-400 text-sm">Loading AI model…</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950 z-30 px-6 gap-4">
          <h2 className="text-surface-100 text-lg sm:text-xl font-bold text-center">
            Camera unavailable
          </h2>
          <p className="text-surface-400 text-sm text-center max-w-xs">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-500 text-surface-950 font-semibold px-8 py-3 rounded-full text-sm min-h-[44px] active:scale-95 transition-transform"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bottom panel — collapsible stats */}
      {session && !error && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          {/* Toggle button */}
          <div className="flex justify-center">
            <button
              onClick={() => setStatsOpen(!statsOpen)}
              className="glass rounded-t-xl px-6 py-2 flex items-center gap-1.5 min-h-[44px] active:scale-95 transition-transform"
              aria-label={statsOpen ? "Hide stats" : "Show stats"}
            >
              <span className="text-[11px] text-surface-400 font-medium">
                {confirmedCount} items · {session.totalCuFt} cu ft
              </span>
              {statsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-surface-400" />
              )}
            </button>
          </div>

          {/* Expanded panel */}
          {statsOpen && (
            <div className="glass mx-3 rounded-xl p-4 mb-2 animate-slide-up">
              {/* Backend badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-wider text-surface-500">
                  Detector
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: badgeColor }}
                >
                  {badgeLabel}
                </span>
              </div>

              {/* Room breakdown */}
              {session.roomSummary.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-2">
                    Rooms
                  </p>
                  <div className="space-y-1">
                    {session.roomSummary.map((r) => (
                      <div
                        key={r.room}
                        className="flex justify-between items-center py-1 px-2 rounded-lg bg-surface-950/40"
                      >
                        <span className="text-xs text-surface-300">{r.room}</span>
                        <span className="text-[11px] tabular-nums">
                          <span className="text-surface-400">{r.itemCount}</span>
                          <span className="text-surface-600 mx-1">·</span>
                          <span className="text-accent-500">{r.cuFt}</span>
                          <span className="text-surface-600 ml-0.5">ft³</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className="text-[10px] text-surface-600 text-center mt-3">
                Everything processed on-device. No video leaves your phone.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
