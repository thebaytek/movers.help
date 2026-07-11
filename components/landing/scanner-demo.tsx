"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, ScanLine, Target } from "lucide-react";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RoomScene {
  name: string;
  bg: string;
  bgDark: string;
  detections: Detection[];
  itemCount: number;
  totalCuFt: number;
}

const ROOM_SCENES: RoomScene[] = [
  {
    name: "Bedroom",
    bg: "linear-gradient(135deg, #0c0c16 0%, #0a0a0a 30%, #08080e 60%, #0c0c16 100%)",
    bgDark: "linear-gradient(135deg, #0c0c16 0%, #0a0a0a 30%, #08080e 60%, #0c0c16 100%)",
    detections: [
      { id: "b1", label: "Queen Bed", confidence: 97, x: 15, y: 35, w: 50, h: 28 },
      { id: "b2", label: "Dresser", confidence: 94, x: 68, y: 28, w: 22, h: 32 },
      { id: "b3", label: "Nightstand", confidence: 91, x: 8, y: 38, w: 12, h: 14 },
      { id: "b4", label: "Table Lamp", confidence: 88, x: 10, y: 25, w: 8, h: 16 },
      { id: "b5", label: "Rug", confidence: 95, x: 20, y: 62, w: 55, h: 8 },
      { id: "b6", label: "Wardrobe", confidence: 93, x: 72, y: 10, w: 20, h: 28 },
      { id: "b7", label: "Laundry Basket", confidence: 85, x: 55, y: 55, w: 10, h: 12 },
    ],
    itemCount: 7,
    totalCuFt: 142,
  },
  {
    name: "Living Room",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #0c0c16 30%, #08080e 60%, #0a0a0a 100%)",
    bgDark: "linear-gradient(135deg, #0a0a0a 0%, #0c0c16 30%, #08080e 60%, #0a0a0a 100%)",
    detections: [
      { id: "l1", label: "3-Seat Sofa", confidence: 98, x: 10, y: 40, w: 55, h: 25 },
      { id: "l2", label: "Coffee Table", confidence: 96, x: 28, y: 58, w: 30, h: 10 },
      { id: "l3", label: "TV Stand", confidence: 94, x: 20, y: 18, w: 40, h: 18 },
      { id: "l4", label: "Bookshelf", confidence: 92, x: 72, y: 15, w: 18, h: 35 },
      { id: "l5", label: "Floor Lamp", confidence: 89, x: 8, y: 20, w: 6, h: 22 },
      { id: "l6", label: "Side Table", confidence: 87, x: 68, y: 50, w: 12, h: 14 },
      { id: "l7", label: "Armchair", confidence: 93, x: 62, y: 42, w: 16, h: 22 },
      { id: "l8", label: "TV (55\")", confidence: 90, x: 30, y: 16, w: 18, h: 4 },
      { id: "l9", label: "Rug", confidence: 96, x: 15, y: 64, w: 65, h: 6 },
    ],
    itemCount: 9,
    totalCuFt: 218,
  },
  {
    name: "Kitchen",
    bg: "linear-gradient(135deg, #0c0c16 0%, #0a0a0a 30%, #08080e 60%, #0c0c16 100%)",
    bgDark: "linear-gradient(135deg, #0c0c16 0%, #0a0a0a 30%, #08080e 60%, #0c0c16 100%)",
    detections: [
      { id: "k1", label: "Refrigerator", confidence: 99, x: 5, y: 10, w: 18, h: 32 },
      { id: "k2", label: "Dining Table", confidence: 97, x: 30, y: 40, w: 40, h: 16 },
      { id: "k3", label: "Dining Chair", confidence: 94, x: 28, y: 52, w: 8, h: 16 },
      { id: "k4", label: "Dining Chair", confidence: 94, x: 42, y: 52, w: 8, h: 16 },
      { id: "k5", label: "Dining Chair", confidence: 92, x: 56, y: 52, w: 8, h: 16 },
      { id: "k6", label: "Bar Stool", confidence: 88, x: 78, y: 48, w: 7, h: 18 },
      { id: "k7", label: "Microwave", confidence: 90, x: 15, y: 28, w: 10, h: 8 },
      { id: "k8", label: "Toaster", confidence: 86, x: 60, y: 28, w: 6, h: 6 },
    ],
    itemCount: 8,
    totalCuFt: 175,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function ScannerDemo() {
  const [roomIndex, setRoomIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState<Detection[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentRoom = ROOM_SCENES[roomIndex];

  const cycleRoom = useCallback(() => {
    setIsTransitioning(true);
    setDetectedItems([]);
    setScanProgress(0);

    setTimeout(() => {
      setRoomIndex((prev) => (prev + 1) % ROOM_SCENES.length);
      setIsTransitioning(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (isTransitioning) return;

    const room = ROOM_SCENES[roomIndex];
    let scan = 0;
    let revealed = 0;
    const scanInterval = 16;

    intervalRef.current = setInterval(() => {
      scan += 1;
      const progress = Math.min(scan / 180, 1);
      setScanProgress(progress);

      const revealThreshold = (revealed + 1) / room.detections.length;
      if (progress >= revealThreshold && revealed < room.detections.length) {
        setDetectedItems((prev) => [...prev, room.detections[revealed]]);
        revealed++;
        if (revealed >= room.detections.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(cycleRoom, 2500);
        }
      }

      if (scan >= 180) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, scanInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [roomIndex, isTransitioning, cycleRoom]);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-[#08080e]">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#76ff03]/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#76ff03]/[0.03] blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-[#76ff03]">See It In Action</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-surface-400 sm:text-lg text-balance">
            Our AI scanner instantly detects every item in your home — furniture,
            boxes, even that weird lamp your aunt gave you. No manual entry required.
          </p>
        </motion.div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto w-full max-w-[340px] sm:max-w-[380px]"
          >
            <div className="relative mx-auto aspect-[9/19] w-full max-w-[340px]">
              {/* Phone frame */}
              <div className="absolute inset-0 rounded-[3rem] border-4 border-surface-800 bg-surface-900 shadow-2xl shadow-black/30 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[40%] h-7 bg-surface-950 rounded-b-2xl">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-surface-700 rounded-full" />
                  <div className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-[#76ff03] rounded-full ring-2 ring-[#76ff03]/30" />
                </div>

                {/* Screen */}
                <div
                  className="absolute inset-[6px] rounded-[2.5rem] overflow-hidden"
                  style={{
                    background: currentRoom.bgDark,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#76ff03]/[0.03] to-[#76ff03]/[0.05]" />

                  {/* Room name header */}
                  <div className="absolute top-14 left-0 right-0 z-10 flex items-center justify-center">
                    <motion.span
                      key={currentRoom.name}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-full bg-surface-950/60 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-white border border-white/10"
                    >
                      {currentRoom.name}
                    </motion.span>
                  </div>

                  {/* Room scene approximation */}
                  <div className="absolute inset-0 p-4 pt-24">
                    {/* Placeholder furniture shapes */}
                    <div className="absolute top-[28%] left-[12%] w-[48%] h-[22%] rounded-lg bg-surface-600/20 border border-surface-600/15" />
                    <div className="absolute top-[22%] left-[68%] w-[22%] h-[28%] rounded-md bg-surface-600/20 border border-surface-600/15" />
                    <div className="absolute top-[48%] left-[8%] w-[10%] h-[12%] rounded bg-surface-600/20 border border-surface-600/15" />
                    <div className="absolute top-[40%] left-[22%] w-[12%] h-[8%] rounded-full bg-surface-600/15 border border-surface-600/15" />
                    <div className="absolute top-[62%] left-[10%] w-[54%] h-[6%] rounded bg-surface-600/15 border border-surface-600/15" />
                  </div>

                  {/* Bounding boxes */}
                  <AnimatePresence>
                    {detectedItems.filter(Boolean).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute z-20"
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: `${item.w}%`,
                          height: `${item.h}%`,
                        }}
                      >
                        <div className="relative w-full h-full rounded border border-[#76ff03] shadow-[0_0_12px_rgba(118,255,3,0.3)]">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.15, 0.08, 0.15] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded bg-[#76ff03]/8"
                          />
                          <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="absolute -top-7 left-0 whitespace-nowrap rounded bg-surface-950/85 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-[#76ff03] border border-[#76ff03]/30"
                          >
                            {item.label}
                            <span className="ml-1.5 text-[9px] text-surface-400 font-medium">
                              {item.confidence}%
                            </span>
                          </motion.span>

                          {/* Corner accents */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#76ff03] rounded-tl"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#76ff03] rounded-tr"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#76ff03] rounded-bl"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#76ff03] rounded-br"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Scanning line */}
                  <motion.div
                    className="absolute left-0 right-0 z-30 pointer-events-none"
                    style={{ top: `${scanProgress * 100}%` }}
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-[#76ff03] to-transparent opacity-80" />
                    <div className="absolute inset-0 h-12 -mt-6 bg-gradient-to-b from-[#76ff03]/0 via-[#76ff03]/[0.06] to-[#76ff03]/0" />
                  </motion.div>

                  {/* Live counter */}
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <motion.div
                      key={currentRoom.name + detectedItems.length}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-surface-950/75 backdrop-blur-lg px-3 py-2 border border-white/10"
                    >
                      <div className="flex items-center justify-between text-white">
                        <span className="text-[11px] font-medium text-surface-400">
                          Items detected
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold tabular-nums text-[#76ff03]">
                            {detectedItems.length}
                          </span>
                          <span className="text-[10px] text-surface-500">|</span>
                          <span className="text-xs font-medium text-surface-300">
                            ~{currentRoom.totalCuFt} cu ft
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats panel */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col gap-5 lg:pt-8"
          >
            <motion.div variants={statVariants}>
              <div className="relative overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5ecc02] to-[#76ff03]" />
                <Target className="w-8 h-8 text-[#76ff03] mb-3" />
                <div className="text-3xl font-bold text-surface-100 tabular-nums">
                  94<span className="text-[#76ff03]">%</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-surface-200">
                  Detection Accuracy
                </div>
                <p className="mt-1.5 text-xs text-surface-400 leading-relaxed">
                  Our model correctly identifies furniture, boxes, and appliances
                  with industry-leading precision refined on 2M+ labeled images.
                </p>
              </div>
            </motion.div>

            <motion.div variants={statVariants}>
              <div className="relative overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#76ff03] to-[#5ecc02]" />
                <ScanLine className="w-8 h-8 text-[#76ff03] mb-3" />
                <div className="text-3xl font-bold text-surface-100 tabular-nums">
                  50<span className="text-[#76ff03]">+</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-surface-200">
                  Furniture Types Recognized
                </div>
                <p className="mt-1.5 text-xs text-surface-400 leading-relaxed">
                  From sofas and beds to lamps and laundry baskets — our AI
                  knows furniture better than most furniture salespeople.
                </p>
              </div>
            </motion.div>

            <motion.div variants={statVariants}>
              <div className="relative overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5ecc02] to-[#76ff03]" />
                <Smartphone className="w-8 h-8 text-[#76ff03] mb-3" />
                <div className="text-3xl font-bold text-surface-100">
                  Real-Time
                </div>
                <div className="mt-1 text-sm font-semibold text-surface-200">
                  Cubic Footage Calculation
                </div>
                <p className="mt-1.5 text-xs text-surface-400 leading-relaxed">
                  Volume estimates update live as each item is detected, giving
                  you an accurate truck-size recommendation before checkout.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ScannerDemo;
