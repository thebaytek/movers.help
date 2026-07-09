"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Edges } from "@react-three/drei";
import { useRef, forwardRef, useImperativeHandle } from "react";
import type { TruckConfig, TruckLoadItem } from "@/types";
import * as THREE from "three";

interface TruckCanvasProps {
  items: (TruckLoadItem & { position?: [number, number, number] })[];
  config: TruckConfig;
  autoRotate?: boolean;
}

export interface TruckCanvasHandle {
  resetCamera: () => void;
  toggleAutoRotate: () => void;
}

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

    return (
      <Canvas
        camera={{
          position: [config.width * 1.8, config.height * 0.8, config.length * 0.6],
          fov: 50,
          near: 0.1,
          far: 200,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        className="rounded-2xl"
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={0.6} castShadow />
        <hemisphereLight args={["#ffffff", "#0B1120", 0.3]} />

        {/* Truck wireframe */}
        <group>
          {/* Truck body outline */}
          <mesh position={[0, config.height / 2, config.length / 2]}>
            <boxGeometry args={[config.width, config.height, config.length]} />
            <meshBasicMaterial
              color={new THREE.Color("#22D3EE")}
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Edges
            visible
            scale={1}
            color="#22D3EE"
            threshold={15}
          >
            <boxGeometry args={[config.width, config.height, config.length]} />
          </Edges>

          {/* Floor */}
          <mesh
            position={[0, 0.01, config.length / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[config.width, config.length]} />
            <meshBasicMaterial
              color={new THREE.Color("#22D3EE")}
              transparent
              opacity={0.04}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Front wall (cab end) */}
          <mesh position={[0, config.height / 2, 0]}>
            <planeGeometry args={[config.width, config.height]} />
            <meshBasicMaterial
              color={new THREE.Color("#22D3EE")}
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Rear door frame */}
          <mesh position={[-config.width / 2, config.height / 2, config.length]}>
            <boxGeometry args={[0.15, config.height, 0.15]} />
            <meshBasicMaterial color={new THREE.Color("#22D3EE")} transparent opacity={0.3} />
          </mesh>
          <mesh position={[config.width / 2, config.height / 2, config.length]}>
            <boxGeometry args={[0.15, config.height, 0.15]} />
            <meshBasicMaterial color={new THREE.Color("#22D3EE")} transparent opacity={0.3} />
          </mesh>
        </group>

        {/* Cargo boxes */}
        {items.map((item) => (
          <group
            key={item.id}
            position={
              item.position
                ? [item.position[0], item.position[1], item.position[2]]
                : [0, item.dimensions[1] / 2, 2 + Math.random() * config.length]
            }
          >
            <mesh>
              <boxGeometry args={item.dimensions} />
              <meshStandardMaterial
                color={new THREE.Color(item.color)}
                transparent
                opacity={0.75}
                roughness={0.5}
                metalness={0.1}
              />
            </mesh>
            <Edges scale={1} color="#ffffff" threshold={15}>
              <boxGeometry args={item.dimensions} />
            </Edges>
          </group>
        ))}

        <Grid
          position={[0, -config.height / 2 - 0.5, config.length / 2]}
          args={[60, 40]}
          cellSize={2}
          cellThickness={0.5}
          cellColor="#22D3EE"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#0E7490"
          fadeDistance={50}
          infiniteGrid
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={8}
          maxDistance={60}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          target={[0, config.height / 3, config.length / 2]}
        />
      </Canvas>
    );
  }
);

export { TruckCanvas };
export default TruckCanvas;
