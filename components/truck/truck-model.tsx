"use client";

import { RoundedBox } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import type { TruckConfig } from "@/types";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Suspense, Component } from "react";

// ── Material colors (procedural fallback) ──
const BODY_COLOR = "#e2e8f0";
const BODY_DARK = "#94a3b8";
const CAB_COLOR = "#cbd5e1";
const FLOOR_COLOR = "#334155";
const WHEEL_COLOR = "#1e1e1e";
const HUB_COLOR = "#94a3b8";
const ACCENT_COLOR = "#475569";
const BUMPER_COLOR = "#1e293b";
const ROOF_RIB_COLOR = "#cbd5e1";

// ── OBJ model loader ──
function OBJModel({ objPath, mtlPath, scale }: { objPath: string; mtlPath: string; scale: number }) {
  const materials = useLoader(MTLLoader, mtlPath);
  const obj = useLoader(OBJLoader, objPath, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  const processed = obj.clone();

  // Center model on cargo floor
  const box = new THREE.Box3().setFromObject(processed);
  const center = new THREE.Vector3();
  box.getCenter(center);
  processed.position.set(-center.x, -box.min.y, -center.z);

  // ponytail: ghost-truck look — green, near-transparent fill + bright edge outlines
  processed.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    // Replace material with transparent green ghost
    child.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#00ff88"),
      transparent: true,
      opacity: 0.15,
      roughness: 0.3,
      metalness: 0.1,
      depthWrite: false,
    });

    // Overlay edge outlines
    const edges = new THREE.EdgesGeometry(child.geometry, 15);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: "#00ff88",
        transparent: true,
        opacity: 0.7,
        depthTest: true,
      })
    );
    child.add(line);
  });

  return <primitive object={processed} scale={[scale, scale, scale]} />;
}

// ── Procedural fallback ──
function ProceduralTruck({ config }: { config: TruckConfig }) {
  const { width: w, height: h, length: l } = config;

  const cabW = w * 1.04;
  const cabH = h * 0.55;
  const cabD = w * 0.55;

  const wheelR = h * 0.14;
  const wheelW = wheelR * 0.45;
  const wheelBase = l * 0.62;
  const rearAxleZ = l * 0.72;
  const frontAxleZ = rearAxleZ - wheelBase;

  const ribCount = Math.floor(l / 3);

  return (
    <group>
      <RoundedBox args={[w, h, l]} radius={0.15} position={[0, h / 2, l / 2]}>
        <meshStandardMaterial color={new THREE.Color(BODY_COLOR)} roughness={0.5} metalness={0.35} />
      </RoundedBox>

      {[0.28, 0.55].map((yFrac) => (
        <group key={`panel-${yFrac}`}>
          {[-1, 1].map((s) => (
            <mesh key={`side-${s}`} position={[s * (w / 2 + 0.01), h * yFrac, l / 2]}>
              <boxGeometry args={[0.04, h * 0.015, l * 0.92]} />
              <meshStandardMaterial color={new THREE.Color(ACCENT_COLOR)} roughness={0.5} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {[-1, 1].map((s) => (
        <mesh key={`post-${s}`} position={[s * (w / 2 - 0.06), h / 2, l - 0.06]}>
          <boxGeometry args={[0.08, h, 0.08]} />
          <meshStandardMaterial color={new THREE.Color(BODY_DARK)} roughness={0.45} metalness={0.4} />
        </mesh>
      ))}

      <mesh position={[0, 0.04, l / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.96, l * 0.96]} />
        <meshStandardMaterial color={new THREE.Color(FLOOR_COLOR)} roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {Array.from({ length: ribCount }, (_, i) => (
        <mesh key={`rib-${i}`} position={[0, h + 0.03, (l / (ribCount + 1)) * (i + 1)]}>
          <boxGeometry args={[w * 0.94, 0.06, 0.08]} />
          <meshStandardMaterial color={new THREE.Color(ROOF_RIB_COLOR)} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      <mesh position={[0, h - 0.1, l - 0.04]}>
        <boxGeometry args={[w * 0.9, 0.1, 0.1]} />
        <meshStandardMaterial color={new THREE.Color(ACCENT_COLOR)} roughness={0.4} metalness={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`pillar-${s}`} position={[s * (w / 2 - 0.06), h / 2, l - 0.04]}>
          <boxGeometry args={[0.08, h - 0.2, 0.1]} />
          <meshStandardMaterial color={new THREE.Color(ACCENT_COLOR)} roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, h / 2, l - 0.01]}>
        <boxGeometry args={[0.03, h * 0.85, 0.06]} />
        <meshStandardMaterial color={new THREE.Color(ACCENT_COLOR)} roughness={0.4} metalness={0.4} />
      </mesh>

      <RoundedBox args={[cabW, cabH, cabD]} radius={0.12} position={[0, cabH / 2, cabD / 2]}>
        <meshStandardMaterial color={new THREE.Color(CAB_COLOR)} roughness={0.45} metalness={0.4} />
      </RoundedBox>

      <mesh position={[0, cabH * 0.72, 0.02]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[cabW * 0.82, cabH * 0.45]} />
        <meshStandardMaterial color={new THREE.Color("#1e3a5f")} roughness={0.15} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, cabH + 0.04, cabD / 2]}>
        <boxGeometry args={[cabW * 0.96, 0.06, cabD * 0.9]} />
        <meshStandardMaterial color={new THREE.Color(ROOF_RIB_COLOR)} roughness={0.5} metalness={0.3} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={`rear-${side}`} position={[side * (w / 2 + wheelW * 0.6), wheelR, rearAxleZ]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[wheelR, wheelR * 0.35, 12, 20]} />
            <meshStandardMaterial color={new THREE.Color(WHEEL_COLOR)} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[wheelR * 0.45, wheelR * 0.45, wheelW, 12]} />
            <meshStandardMaterial color={new THREE.Color(HUB_COLOR)} roughness={0.3} metalness={0.55} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={`rear-inner-${side}`} position={[side * (w / 2 - wheelW * 1.2), wheelR, rearAxleZ]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[wheelR, wheelR * 0.35, 12, 20]} />
            <meshStandardMaterial color={new THREE.Color(WHEEL_COLOR)} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[wheelR * 0.45, wheelR * 0.45, wheelW, 12]} />
            <meshStandardMaterial color={new THREE.Color(HUB_COLOR)} roughness={0.3} metalness={0.55} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={`front-${side}`} position={[side * (w / 2 + wheelW * 0.6), wheelR, frontAxleZ]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[wheelR, wheelR * 0.35, 12, 20]} />
            <meshStandardMaterial color={new THREE.Color(WHEEL_COLOR)} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[wheelR * 0.45, wheelR * 0.45, wheelW, 12]} />
            <meshStandardMaterial color={new THREE.Color(HUB_COLOR)} roughness={0.3} metalness={0.55} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, h * 0.1, l + 0.06]}>
        <boxGeometry args={[w * 0.7, h * 0.08, 0.15]} />
        <meshStandardMaterial color={new THREE.Color(BUMPER_COLOR)} roughness={0.7} metalness={0.3} />
      </mesh>

      {[-1, 1].map((side) =>
        [l * 0.25, l * 0.75].map((z, i) => (
          <mesh key={`light-${side}-${i}`} position={[side * (w / 2 + 0.03), h * 0.35, z]}>
            <boxGeometry args={[0.06, 0.08, 0.04]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.1} emissive="#f59e0b" emissiveIntensity={0.4} />
          </mesh>
        ))
      )}
    </group>
  );
}

// ── Error boundary for model load failures ──
class ErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function TruckModel({ config }: { config: TruckConfig }) {
  if (config.modelPath && config.modelMtlPath) {
    return (
      <ErrorBoundary fallback={<ProceduralTruck config={config} />}>
        <Suspense fallback={<ProceduralTruck config={config} />}>
          <OBJModel objPath={config.modelPath} mtlPath={config.modelMtlPath} scale={config.modelScale ?? 1.0} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return <ProceduralTruck config={config} />;
}
