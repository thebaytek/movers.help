"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import type { TruckConfig, TruckLoadItem } from "@/types";
import * as THREE from "three";
import { TruckModel } from "./truck-model";
import { FurnitureGeometry } from "./furniture-geometry";
import { ScanPlane } from "./scan-plane";
import { WaypointMarker } from "./waypoint-marker";

interface TruckCanvasProps {
  items: (TruckLoadItem & { position?: [number, number, number] })[];
  config: TruckConfig;
  autoRotate?: boolean;
}

export interface TruckCanvasHandle {
  resetCamera: () => void;
  toggleAutoRotate: () => void;
}

// ── Brand colors ──
const GREEN = "#76ff03";
const DARK_GREEN = "#0a5e00";
const VOID = "#08080e";

const TruckCanvas = forwardRef<TruckCanvasHandle, TruckCanvasProps>(
  function TruckCanvas({ items, config, autoRotate = true }, ref) {
    const controlsRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        controlsRef.current?.reset();
      },
      toggleAutoRotate: () => {
        if (controlsRef.current) {
          controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
        }
      },
    }));

    const cargoStartZ = config.cargoStartZ ?? 0;
    const cargoEndZ = cargoStartZ + (config.cargoLength ?? config.length);
    const cargoMidZ = (cargoStartZ + cargoEndZ) / 2;

    const waypointPositions = useMemo(() => {
      const positions: [number, number, number][] = [];
      const y = -config.height / 2 - 0.4;
      positions.push([-config.width / 2 - 1, y, cargoStartZ]);
      positions.push([config.width / 2 + 1, y, cargoStartZ]);
      positions.push([-config.width / 2 - 1, y, cargoEndZ]);
      positions.push([config.width / 2 + 1, y, cargoEndZ]);
      return positions;
    }, [config, cargoStartZ, cargoEndZ]);

    return (
      <Canvas
        camera={{
          position: [config.width * 1.8, config.height * 0.8, cargoMidZ + (config.cargoLength ?? config.length) * 0.5],
          fov: 50,
          near: 0.1,
          far: 200,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        className="rounded-2xl"
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
        <hemisphereLight args={["#e2e8f0", VOID, 0.5]} />
        <pointLight position={[0, config.height * 0.6, cargoMidZ]} intensity={0.4} color="#00ff88" />

        {/* Realistic truck model */}
        <TruckModel config={config} />

        {/* Scanning plane */}
        <ScanPlane config={config} />

        {/* Cargo items — now rendered as furniture shapes */}
        {items.map((item) => (
          <group
            key={item.id}
            position={
              item.position
                ? [item.position[0], item.position[1], item.position[2]]
                : [0, item.dimensions[1] / 2, cargoStartZ + 1 + Math.random() * (cargoEndZ - cargoStartZ - 2)]
            }
          >
            <FurnitureGeometry
              label={item.label}
              dimensions={item.dimensions}
              color={item.color}
            />
          </group>
        ))}

        {/* Ground grid */}
        <Grid
          position={[0, -config.height / 2 - 0.5, cargoMidZ]}
          args={[60, 40]}
          cellSize={2}
          cellThickness={0.5}
          cellColor={DARK_GREEN}
          sectionSize={10}
          sectionThickness={1}
          sectionColor={GREEN}
          fadeDistance={50}
          infiniteGrid
        />

        {/* Waypoint markers */}
        {waypointPositions.map((pos, i) => (
          <WaypointMarker key={i} position={pos} />
        ))}

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={8}
          maxDistance={60}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          target={[0, config.height / 3, cargoMidZ]}
        />
      </Canvas>
    );
  }
);

export { TruckCanvas };
export default TruckCanvas;
