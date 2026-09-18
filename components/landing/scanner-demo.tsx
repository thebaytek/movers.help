"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Crosshair, ScanLine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Shape = "sofa" | "table" | "tv" | "chair" | "bed" | "box";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: Shape;
  cuFt: number;
}

/** Single living-room walkthrough that mirrors calibrate → detect → review */
const DEMO_ITEMS: Detection[] = [
  { id: "l1", label: "Sofa (3-seater)", confidence: 98, x: 8, y: 42, w: 50, h: 24, shape: "sofa", cuFt: 58 },
  { id: "l2", label: "Dining Table", confidence: 96, x: 24, y: 57, w: 26, h: 11, shape: "table", cuFt: 30 },
  { id: "l3", label: "TV Stand", confidence: 94, x: 27, y: 20, w: 24, h: 15, shape: "tv", cuFt: 8 },
  { id: "l4", label: "Dining Chair", confidence: 93, x: 66, y: 46, w: 17, h: 21, shape: "chair", cuFt: 7 },
];

export const SCANNER_DEMO_LABELS = DEMO_ITEMS.map((item) => item.label);

const ORDERED_ITEMS = [...DEMO_ITEMS].sort((a, b) => a.y - b.y);

type Phase = "calibrate" | "detect" | "review";

const PHASES: { id: Phase; title: string; blurb: string }[] = [
  {
    id: "calibrate",
    title: "1 · Calibrate",
    blurb: "Confirm a doorway or appliance and distance so measurements lock to real-world scale.",
  },
  {
    id: "detect",
    title: "2 · Detect",
    blurb: "Supported furniture lights up with labels and cubic feet while unrelated objects stay ignored.",
  },
  {
    id: "review",
    title: "3 · Review",
    blurb: "Edit labels, quantities, and rooms before the inventory is submitted to the moving team.",
  },
];

function Silhouette({ shape }: { shape: Shape }) {
  const fill = "rgba(120,134,156,0.5)";
  const fillSoft = "rgba(120,134,156,0.3)";
  const line = "rgba(190,200,215,0.55)";

  switch (shape) {
    case "sofa":
      return (
        <div className="relative h-full w-full">
          <div className="absolute top-0 left-[6%] h-[36%] w-[88%] rounded-t-md" style={{ background: fill }} />
          <div className="absolute bottom-0 left-0 h-[64%] w-[12%] rounded" style={{ background: fill }} />
          <div className="absolute bottom-0 right-0 h-[64%] w-[12%] rounded" style={{ background: fill }} />
          <div className="absolute bottom-0 left-[14%] h-[56%] w-[36%] rounded" style={{ background: fillSoft }} />
          <div className="absolute bottom-0 right-[14%] h-[56%] w-[36%] rounded" style={{ background: fillSoft }} />
        </div>
      );
    case "table":
      return (
        <div className="relative h-full w-full">
          <div className="absolute top-0 left-0 h-[22%] w-full rounded-sm" style={{ background: fill }} />
          <div className="absolute top-[22%] left-[10%] h-[78%] w-[6%]" style={{ background: fill }} />
          <div className="absolute top-[22%] right-[10%] h-[78%] w-[6%]" style={{ background: fill }} />
        </div>
      );
    case "tv":
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="h-[70%] w-full rounded-sm border"
            style={{ borderColor: line, background: "rgba(15,23,42,0.7)" }}
          />
        </div>
      );
    case "chair":
      return (
        <div className="relative h-full w-full">
          <div className="absolute top-0 left-[18%] h-[30%] w-[64%] rounded-t" style={{ background: fill }} />
          <div className="absolute top-[34%] left-[8%] h-[38%] w-[84%] rounded-sm" style={{ background: fillSoft }} />
          <div className="absolute bottom-0 left-[12%] h-[26%] w-[8%]" style={{ background: fill }} />
          <div className="absolute bottom-0 right-[12%] h-[26%] w-[8%]" style={{ background: fill }} />
        </div>
      );
    case "bed":
      return (
        <div className="relative h-full w-full">
          <div className="absolute top-0 left-[4%] h-[22%] w-[92%] rounded-sm" style={{ background: fill }} />
          <div className="absolute top-[24%] left-0 h-[70%] w-full rounded" style={{ background: fillSoft }} />
        </div>
      );
    default:
      return <div className="h-full w-full rounded" style={{ background: fillSoft }} />;
  }
}

function WireframeBox({ item }: { item: Detection }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute z-20"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${item.w}%`,
        height: `${item.h}%`,
      }}
    >
      <div className="absolute inset-0 border border-[#76ff03]/25" />
      <div className="absolute -left-px -top-px h-2.5 w-2.5 border-l-2 border-t-2 border-[#76ff03]" />
      <div className="absolute -right-px -top-px h-2.5 w-2.5 border-r-2 border-t-2 border-[#76ff03]" />
      <div className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-[#76ff03]" />
      <div className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-[#76ff03]" />
      <div className="absolute inset-[3px]">
        <Silhouette shape={item.shape} />
      </div>
      <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-[#76ff03]/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#08080e]">
        {item.label} · {item.cuFt} ft³ · {item.confidence}%
      </span>
    </motion.div>
  );
}

function RoomCamera() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #2a2a3d 0%, #232336 38%, #1c1c2c 58%, #131320 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-[58%] h-px bg-white/[0.1]" />
      <div
        className="absolute inset-x-0 bottom-0 top-[58%]"
        style={{
          background: "linear-gradient(180deg, #33334a 0%, #262639 40%, #191926 100%)",
        }}
      />
      {[18, 38, 62, 84].map((x) => (
        <div
          key={x}
          className="absolute top-[58%] bottom-0 w-px"
          style={{
            left: `${x}%`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.09), transparent)",
            transform: `skewX(${x < 50 ? 8 : -8}deg)`,
          }}
        />
      ))}
      <div
        className="absolute rounded-sm"
        style={{
          top: "12%",
          right: "8%",
          width: "16%",
          height: "34%",
          background:
            "linear-gradient(180deg, rgba(150,175,220,0.36), rgba(150,175,220,0.15))",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 95% 85% at 50% 45%, transparent 62%, rgba(4,4,8,0.42) 100%)",
        }}
      />
    </div>
  );
}

export function ScannerDemo() {
  const [phase, setPhase] = useState<Phase>("calibrate");
  const [scanProgress, setScanProgress] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [reviewChecked, setReviewChecked] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const revealedItems = ORDERED_ITEMS.slice(0, revealedCount);
  const revealedCuFt = revealedItems.reduce((sum, item) => sum + item.cuFt, 0);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const runDetect = useCallback(() => {
    clearTimer();
    setPhase("detect");
    setScanProgress(0);
    setRevealedCount(0);
    let scan = 0;
    let revealed = 0;
    intervalRef.current = setInterval(() => {
      scan += 1;
      const progress = Math.min(scan / 160, 1);
      setScanProgress(progress);
      const scanY = progress * 100;
      const next = ORDERED_ITEMS[revealed];
      if (next && scanY >= next.y + 4) {
        revealed += 1;
        setRevealedCount(revealed);
      }
      if (revealed >= ORDERED_ITEMS.length && progress >= 1) {
        clearTimer();
        setTimeout(() => {
          setPhase("review");
          setReviewChecked(0);
        }, 700);
      }
    }, 16);
  }, []);

  useEffect(() => {
    setPhase("calibrate");
    setRevealedCount(0);
    setScanProgress(0);
    setReviewChecked(0);
    const t = setTimeout(runDetect, 2200);
    return () => {
      clearTimeout(t);
      clearTimer();
    };
  }, [runDetect]);

  useEffect(() => {
    if (phase !== "review") return;
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setReviewChecked(Math.min(n, DEMO_ITEMS.length));
      if (n >= DEMO_ITEMS.length) {
        clearInterval(t);
        setTimeout(() => {
          setPhase("calibrate");
          setRevealedCount(0);
          setScanProgress(0);
          setReviewChecked(0);
          setTimeout(runDetect, 2200);
        }, 2800);
      }
    }, 450);
    return () => clearInterval(t);
  }, [phase, runDetect]);

  const activePhase = PHASES.find((p) => p.id === phase)!;

  return (
    <section id="see-it-in-action" className="relative py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-surface-50 sm:text-4xl lg:text-5xl">
            See it in action
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-surface-400 sm:text-lg">
            The same workflow as the live scanner: calibrate scale, detect
            supported furniture, then review before submit.
          </p>
        </div>

        {/* Phase rail — one job, not feature cards */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 sm:flex-row sm:gap-4">
          {PHASES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                clearTimer();
                if (p.id === "calibrate") {
                  setPhase("calibrate");
                  setRevealedCount(0);
                  setScanProgress(0);
                  setTimeout(runDetect, 1800);
                } else if (p.id === "detect") {
                  runDetect();
                } else {
                  setPhase("review");
                  setRevealedCount(DEMO_ITEMS.length);
                  setScanProgress(1);
                  setReviewChecked(0);
                }
              }}
              className={`flex-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                phase === p.id
                  ? "border-[#76ff03]/35 bg-surface-900"
                  : "border-surface-800 bg-transparent hover:border-surface-700"
              }`}
            >
              <div
                className={`text-sm font-semibold ${
                  phase === p.id ? "text-[#76ff03]" : "text-surface-300"
                }`}
              >
                {p.title}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-surface-500">{p.blurb}</p>
            </button>
          ))}
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-[340px]"
          >
            <div className="relative mx-auto aspect-[9/19] w-full">
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-surface-700 bg-surface-900">
                <div className="absolute left-1/2 top-0 z-20 h-6 w-[36%] -translate-x-1/2 rounded-b-xl bg-surface-950" />
                <div className="absolute inset-[5px] overflow-hidden rounded-[1.65rem] bg-surface-950">
                  <RoomCamera />

                  {phase === "calibrate" && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-950/55 px-5">
                      <div className="w-full max-w-[240px] rounded-xl border border-[#76ff03]/30 bg-surface-950/95 p-4">
                        <div className="flex items-center gap-2 text-[#76ff03]">
                          <Crosshair className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Calibrate scale
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-surface-400">
                          Point at a doorway · set distance · lock real-world
                          measurements.
                        </p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded bg-surface-800">
                          <motion.div
                            className="h-full bg-[#76ff03]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "linear" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute left-0 right-0 top-12 z-10 flex justify-center">
                    <span className="rounded-lg border border-white/10 bg-surface-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#76ff03]">
                      Living Room
                    </span>
                  </div>

                  {phase !== "calibrate" && (
                    <div className="absolute right-3 top-12 z-10 flex items-center gap-1 rounded-lg border border-[#76ff03]/25 bg-surface-950/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#76ff03]">
                      <Crosshair className="h-3 w-3" />
                      Calibrated
                    </div>
                  )}

                  <AnimatePresence>
                    {(phase === "detect" || phase === "review") &&
                      revealedItems.map((item) => (
                        <WireframeBox key={item.id} item={item} />
                      ))}
                  </AnimatePresence>

                  {phase === "detect" && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-30"
                      style={{ top: `${scanProgress * 100}%` }}
                    >
                      <div className="h-px bg-gradient-to-r from-transparent via-[#76ff03] to-transparent opacity-80" />
                    </div>
                  )}

                  <div className="absolute inset-x-3 bottom-3 z-20">
                    {phase === "review" ? (
                      <div className="space-y-1.5 rounded-xl border border-white/10 bg-surface-950/90 p-2.5">
                        {DEMO_ITEMS.map((item, i) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[11px]"
                            style={{
                              background:
                                i < reviewChecked
                                  ? "rgba(118,255,3,0.08)"
                                  : "transparent",
                            }}
                          >
                            <span className="truncate text-surface-200">{item.label}</span>
                            <span className="flex items-center gap-1.5 tabular-nums text-surface-400">
                              {item.cuFt} ft³
                              {i < reviewChecked && (
                                <Check className="h-3 w-3 text-[#76ff03]" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-surface-950/80 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-surface-400">
                            {phase === "calibrate" ? "Waiting for scale…" : "Items detected"}
                          </span>
                          <span className="font-semibold tabular-nums text-[#76ff03]">
                            {revealedItems.length}
                            <span className="mx-1 text-surface-600">|</span>
                            {revealedCuFt} cu ft
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col justify-center gap-6 lg:pl-4">
            <div>
              <div className="flex items-center gap-2 text-[#76ff03]">
                <ScanLine className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {activePhase.title}
                </span>
              </div>
              <p className="mt-3 max-w-md text-lg leading-relaxed text-surface-300">
                {activePhase.blurb}
              </p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-surface-500">
              Furniture and large move items only — small clutter is ignored or
              rolled into box counts. Detection stays on-device; you review before
              anything is submitted.
            </p>
            <div>
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/scan">
                  Try it with your camera
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScannerDemo;
