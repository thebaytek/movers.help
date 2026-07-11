"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GREEN = "#76ff03";

export function WaypointMarker({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 1.5) * 0.15;
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      ringRef.current.scale.setScalar(s);
      mat.opacity = 0.3 + Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Center dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.2, 6]} />
        <meshBasicMaterial
          color={new THREE.Color(GREEN)}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 6]} />
        <meshBasicMaterial
          color={new THREE.Color(GREEN)}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
