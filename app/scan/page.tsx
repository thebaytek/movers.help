"use client";

import { useEffect, useRef, useState } from "react";
import { createWebScanner, type ScannerSession } from "@/lib/scanner-web";

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
  const [currentRoom, setCurrentRoom] = useState("Living Room");
  const ROOMS = ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Office", "Garage", "Other"];

  useEffect(() => {
    const scanner = createWebScanner();
    scannerRef.current = scanner;
    let mounted = true;

    (async () => {
      try {
        await scanner.initialize();
        if (!containerRef.current || !mounted) return;
        await scanner.startCamera(containerRef.current);
        scanner.startScanning((s) => {
          if (mounted) {
            setSession(s);
            setLoading(false);
          }
        });
        scanner.setRoom("Living Room");
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Camera failed");
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      scanner.stopScanning();
      scanner.dispose();
    };
  }, []);

  const backend = session?.backend ?? "simulated";
  const badgeColor = BACKEND_COLORS[backend];
  const badgeLabel = BACKEND_LABELS[backend];

  return (
    <main className="relative h-screen bg-[#0B1120] overflow-hidden">
      {/* Room picker */}
      <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/[0.06] max-w-full pointer-events-auto">
          {ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => {
                setCurrentRoom(room);
                scannerRef.current?.setRoom(room);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                currentRoom === room
                  ? "bg-cyan-400 text-[#0B1120]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
              }`}
            >
              {room}
            </button>
          ))}
        </div>
      </div>

      {/* Camera container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Bbox overlays */}
      {session?.detections.map((d) => (
        <div
          key={`${d.trackingId}-${d.class}`}
          className="absolute z-10 border-2 rounded"
          style={{
            left: `${d.bbox.x * 100}%`,
            top: `${d.bbox.y * 100}%`,
            width: `${d.bbox.w * 100}%`,
            height: `${d.bbox.h * 100}%`,
            borderColor: badgeColor,
          }}
        >
          <span
            className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap"
            style={{ backgroundColor: badgeColor, color: "#0B1120" }}
          >
            {d.inventoryLabel} · {Math.round(d.confidence * 100)}%
          </span>
        </div>
      ))}

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B1120]/85 z-20">
          <p className="text-slate-400 text-base">Loading AI model…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B1120]/85 z-20 px-8 gap-4">
          <h2 className="text-slate-100 text-xl font-bold">Camera unavailable</h2>
          <p className="text-slate-400 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-400 text-[#0B1120] font-bold px-6 py-3 rounded-full"
          >
            Retry
          </button>
        </div>
      )}

      {/* Backend badge */}
      {session && !error && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/85 px-4 py-2 rounded-lg z-20">
          <p className="text-xs font-semibold" style={{ color: badgeColor }}>
            {badgeLabel} · {session.detections.length} active · {session.confirmedItems.length} confirmed
          </p>
        </div>
      )}

      {/* Cu ft counter */}
      {session && session.confirmedItems.length > 0 && (
        <div className="absolute top-4 right-4 z-30 bg-slate-900/85 backdrop-blur-md rounded-xl border border-cyan-400/20 px-4 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Total</p>
          <p className="text-lg font-bold text-cyan-400">{session.totalCuFt} <span className="text-xs font-normal text-slate-400">cu ft</span></p>
        </div>
      )}

      {/* Room summary */}
      {session && session.confirmedItems.length > 0 && (
        <div className="absolute bottom-20 left-4 z-20 bg-slate-900/85 backdrop-blur-md rounded-xl border border-white/[0.06] p-3 max-w-[180px]">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Rooms</p>
          {session.roomSummary.slice(0, 5).map((r) => (
            <div key={r.room} className="flex justify-between items-center py-0.5">
              <span className="text-[11px] text-slate-300 truncate mr-2">{r.room}</span>
              <span className="text-[11px] text-slate-500">{r.itemCount}</span>
            </div>
          ))}
          {session.roomSummary.length > 5 && (
            <p className="text-[10px] text-slate-600 mt-1">
              +{session.roomSummary.length - 5} more
            </p>
          )}
        </div>
      )}

      {/* Privacy notice */}
      <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-600 z-20">
        Everything processed on-device. No video leaves your phone.
      </p>
    </main>
  );
}
