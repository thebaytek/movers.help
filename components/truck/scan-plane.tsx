"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { TruckConfig } from "@/types";
import * as THREE from "three";

const LIME = "#76ff03";

export function ScanPlane({ config }: { config: TruckConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startZ = config.cargoStartZ ?? 0;
  const endZ = startZ + (config.cargoLength ?? config.length);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      meshRef.current.position.z = startZ + ((Math.sin(t * 0.6) + 1) / 2) * (endZ - startZ);
      mat.opacity = 0.08 + Math.sin(t * 2) * 0.04;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, config.height / 2, startZ]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[config.width * 1.1, 0.15]} />
      <meshBasicMaterial
        color={new THREE.Color(LIME)}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
