"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Truck, ArrowRight, RotateCw, Info, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TRUCK_26FT,
  TRUCK_53FT,
  computeItemPositions,
  generateDemoInventory,
  calculateFillPercentage,
} from "@/lib/truckConfig";
import type { TruckConfig } from "@/types";
import type { TruckCanvasHandle } from "@/components/truck/truck-canvas";
import { Canvas, } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FurnitureGeometry } from "@/components/truck/furniture-geometry";

const TruckCanvas = dynamic(
  () => import("@/components/truck/truck-canvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-2xl bg-surface-900 animate-pulse flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-surface-400 animate-spin" />
      </div>
    ),
  }
);

export function TruckViewer() {
  const [truckConfig, setTruckConfig] = useState<TruckConfig>(TRUCK_26FT);
  const [autoRotate] = useState(true);
  const canvasRef = useRef<TruckCanvasHandle>(null);

  const demoItems = useMemo(() => generateDemoInventory(), []);

  const positionedItems = useMemo(
    () => computeItemPositions(demoItems, truckConfig),
    [demoItems, truckConfig]
  );

  const fillPercentage = useMemo(
    () => calculateFillPercentage(demoItems, truckConfig),
    [demoItems, truckConfig]
  );

  const totalCuFt = useMemo(
    () => positionedItems.reduce((sum, item) => sum + item.cuFt, 0),
    [positionedItems]
  );

  const roomSummary = useMemo(() => {
    const map: Record<string, { count: number; cuFt: number; color: string }> = {};
    for (const item of positionedItems) {
      if (!map[item.room]) {
        map[item.room] = { count: 0, cuFt: 0, color: item.color };
      }
      map[item.room].count++;
      map[item.room].cuFt += item.cuFt;
    }
    return Object.entries(map).map(([room, data]) => ({ room, ...data }));
  }, [positionedItems]);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const previewItem = positionedItems.find((i) => i.id === selectedItem) ?? positionedItems[0];

  const scrollToQuote = useCallback(() => {
    const el = document.getElementById("quote");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <section id="truck-viewer" className="relative py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-[#76ff03]">See Exactly How Your Stuff Fits</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-surface-400 sm:text-lg text-balance">
            Our 3D truck simulator places every detected item into a real truck
            model so you know exactly what size truck you need — before you pay a dime.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          {/* 3D Viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-surface-800 shadow-xl shadow-black/20 bg-surface-950">
              <div className="h-[500px]">
                <TruckCanvas
                  ref={canvasRef}
                  items={positionedItems}
                  config={truckConfig}
                  autoRotate={autoRotate}
                />
              </div>

              {/* Camera hint overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-surface-950/60 backdrop-blur-md px-2.5 py-1.5 text-[11px] text-surface-300 border border-white/10">
                <RotateCw className="w-3 h-3" />
                Drag to rotate &middot; Scroll to zoom
              </div>
            </div>
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-5"
          >
            {/* Truck size toggle */}
            <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-[#76ff03]" />
                <span className="text-sm font-semibold text-surface-200">
                  Truck Size
                </span>
              </div>
              <div className="flex rounded-xl bg-surface-800 p-1 gap-1">
                {[TRUCK_26FT, TRUCK_53FT].map((cfg) => (
                  <button
                    key={cfg.name}
                    onClick={() => setTruckConfig(cfg)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
                      truckConfig.name === cfg.name
                        ? "bg-surface-700 text-surface-100 shadow-sm"
                        : "text-surface-400 hover:text-surface-200"
                    )}
                  >
                    {cfg.name.split(" ")[0]}
                    <span className="block text-[10px] font-normal text-surface-500">
                      {cfg.name.includes("26") ? "26 ft" : "53 ft"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fill percentage */}
            <motion.div
              key={truckConfig.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                  Trailer Fill
                </span>
                <span className="text-sm font-bold tabular-nums text-surface-100">
                  {fillPercentage}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-surface-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercentage}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  className={cn(
                    "h-full rounded-full transition-colors duration-500",
                    fillPercentage > 85
                      ? "bg-gradient-to-r from-[#76ff03] to-red-500"
                      : fillPercentage > 60
                        ? "bg-gradient-to-r from-[#76ff03] to-[#5ecc02]"
                        : "bg-gradient-to-r from-[#5ecc02] to-[#76ff03]"
                  )}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-surface-400">0</span>
                <span className="text-[10px] text-surface-400">{truckConfig.maxCuFt} cu ft</span>
              </div>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-surface-800 bg-surface-900 p-4 shadow-sm">
                <div className="text-2xl font-bold text-surface-100 tabular-nums">
                  {positionedItems.length}
                </div>
                <div className="mt-0.5 text-xs text-surface-400">
                  Items loaded
                </div>
              </div>
              <div className="rounded-xl border border-surface-800 bg-surface-900 p-4 shadow-sm">
                <div className="text-2xl font-bold text-surface-100 tabular-nums">
                  {totalCuFt.toLocaleString()}
                </div>
                <div className="mt-0.5 text-xs text-surface-400">
                  Total cubic feet
                </div>
              </div>
            </div>

            {/* Room legend */}
            <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-surface-400" />
                <span className="text-sm font-semibold text-surface-200">
                  Rooms
                </span>
              </div>
              <div className="space-y-2">
                {roomSummary.map(({ room, count, cuFt, color }) => (
                  <div key={room} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-surface-950"
                      style={{ backgroundColor: color, "--tw-ring-color": color + "40" } as React.CSSProperties}
                    />
                    <span className="flex-1 text-xs text-surface-300 truncate">
                      {room}
                    </span>
                    <span className="text-[10px] text-surface-400 tabular-nums">
                      {count} items &middot; {cuFt} cu ft
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Master inventory list with 3D preview */}
            <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-surface-400" />
                <span className="text-sm font-semibold text-surface-200">
                  Inventory ({positionedItems.length})
                </span>
              </div>
              {previewItem && (
                <div className="flex gap-3 mb-3 rounded-xl border border-surface-800 bg-surface-950/60 p-3">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-950">
                    <Canvas
                      camera={{ position: [3.5, 2.8, 4.5], fov: 42 }}
                      dpr={[1, 1.5]}
                      gl={{ antialias: true, alpha: true }}
                      style={{ background: "transparent" }}
                    >
                      <ambientLight intensity={0.9} />
                      <directionalLight position={[4, 6, 4]} intensity={1.1} />
                      <group>
                        <FurnitureGeometry
                          label={previewItem.label}
                          dimensions={previewItem.dimensions}
                          color={previewItem.color}
                        />
                      </group>
                      <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} enablePan={false} />
                    </Canvas>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-surface-100 truncate">
                      {previewItem.label}
                    </div>
                    <div className="text-[11px] text-surface-400 mt-0.5">
                      {previewItem.room} &middot; {previewItem.cuFt} cu ft
                    </div>
                    <div className="text-[10px] text-surface-500 mt-1 tabular-nums">
                      {previewItem.dimensions.map((d) => d.toFixed(1)).join(" × ")} ft
                    </div>
                    <div
                      className="mt-2 h-1 rounded-full"
                      style={{ backgroundColor: previewItem.color }}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
                {positionedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      previewItem?.id === item.id
                        ? "bg-surface-800"
                        : "hover:bg-surface-800/50"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1 text-[11px] text-surface-300 truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-surface-500 tabular-nums">
                      {item.cuFt} ft³
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              variant="accent"
              size="lg"
              onClick={scrollToQuote}
              className="w-full"
            >
              <span>Try With Your Items</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default TruckViewer;
