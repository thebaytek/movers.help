"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// ── Shared material helpers ──

function itemMaterial(color: string, roughness = 0.55, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
  });
}

function darkAccent(color: string) {
  return new THREE.Color(color).multiplyScalar(0.55).getHexString();
}

// ═══════════════════════════════════════════════════════════════
// Individual furniture geometry functions
// Each takes { dimensions: [w, h, d], color } and returns JSX
// ═══════════════════════════════════════════════════════════════

function SofaGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const seatH = h * 0.4;
  const backH = h * 0.55;
  const armW = w * 0.12;
  const cushionW = (w - armW * 2) / 3;
  const mat = itemMaterial(color, 0.6, 0.05);
  const woodMat = itemMaterial(darkAccent(color), 0.7, 0.0);

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, h * 0.08, 0]} material={woodMat}>
        <boxGeometry args={[w, h * 0.12, d]} />
      </mesh>
      {/* Seat cushions (3) */}
      {[-1, 0, 1].map((i) => (
        <RoundedBox
          key={i}
          args={[cushionW * 0.9, seatH, d * 0.85]}
          radius={0.15}
          position={[i * cushionW, seatH + h * 0.1, 0]}
        >
          <meshStandardMaterial color={new THREE.Color(color)} roughness={0.5} metalness={0.03} />
        </RoundedBox>
      ))}
      {/* Backrest */}
      <RoundedBox args={[w * 0.94, backH, d * 0.22]} radius={0.12} position={[0, h * 0.58, -d * 0.38]}>
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.85)} roughness={0.55} metalness={0.03} />
      </RoundedBox>
      {/* Armrests */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[armW * 0.9, h * 0.35, d * 0.75]}
          radius={0.1}
          position={[side * (w / 2 - armW / 2), h * 0.28, 0]}
        >
          <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.88)} roughness={0.5} metalness={0.04} />
        </RoundedBox>
      ))}
    </group>
  );
}

function BedGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const mattressH = h * 0.55;
  const frameH = h * 0.18;

  return (
    <group>
      {/* Frame rails */}
      <mesh position={[0, frameH / 2, 0]} material={itemMaterial(darkAccent(color), 0.65, 0.0)}>
        <boxGeometry args={[w, frameH, d]} />
      </mesh>
      {/* Mattress */}
      <RoundedBox args={[w * 0.92, mattressH, d * 0.94]} radius={0.18} position={[0, frameH + mattressH / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color("#f5f5f0")} roughness={0.7} metalness={0.0} />
      </RoundedBox>
      {/* Headboard */}
      <mesh position={[0, h * 0.58, -d * 0.46]} material={itemMaterial(darkAccent(color), 0.55, 0.05)}>
        <boxGeometry args={[w * 0.96, h * 0.4, d * 0.06]} />
      </mesh>
    </group>
  );
}

function TableGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const topH = h * 0.12;
  const legH = h * 0.82;
  const legR = Math.min(w, d) * 0.04;
  const inset = Math.min(w, d) * 0.12;

  return (
    <group>
      {/* Tabletop */}
      <RoundedBox args={[w, topH, d]} radius={0.08} position={[0, h - topH / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color(color)} roughness={0.45} metalness={0.08} />
      </RoundedBox>
      {/* 4 legs */}
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - inset), legH / 2, sz * (d / 2 - inset)]} material={itemMaterial(darkAccent(color), 0.6, 0.02)}>
          <cylinderGeometry args={[legR, legR * 0.85, legH, 8]} />
        </mesh>
      ))}
      {/* Apron rails */}
      {[
        [0, 0, -1],
        [0, 0, 1],
        [-1, 0, 0],
        [1, 0, 0],
      ].map(([rx, _, rz], i) => (
        <mesh
          key={`apron-${i}`}
          position={[
            rx === 0 ? 0 : rx * (w / 2 - inset),
            h * 0.82,
            rz === 0 ? 0 : rz * (d / 2 - inset),
          ]}
          rotation={[0, rx === 0 ? 0 : Math.PI / 2, 0]}
          material={itemMaterial(darkAccent(color), 0.55, 0.03)}
        >
          <boxGeometry args={[rx === 0 ? w - inset * 2 : d - inset * 2, h * 0.06, h * 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

function ChairGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const seatH = h * 0.35;
  const legH = h * 0.42;
  const legR = Math.min(w, d) * 0.05;

  return (
    <group>
      {/* 4 legs */}
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh
          key={i}
          position={[sx * (w / 2 - w * 0.1), legH / 2, sz * (d / 2 - w * 0.1)]}
          material={itemMaterial(darkAccent(color), 0.6, 0.04)}
        >
          <cylinderGeometry args={[legR, legR * 0.8, legH, 8]} />
        </mesh>
      ))}
      {/* Seat */}
      <RoundedBox args={[w * 0.9, seatH, d * 0.85]} radius={0.1} position={[0, legH + seatH / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color(color)} roughness={0.5} metalness={0.04} />
      </RoundedBox>
      {/* Backrest */}
      <RoundedBox args={[w * 0.78, h * 0.38, d * 0.1]} radius={0.08} position={[0, legH + seatH + h * 0.2, -d * 0.38]}>
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.85)} roughness={0.55} metalness={0.03} />
      </RoundedBox>
    </group>
  );
}

function BookshelfGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const shelfCount = 5;
  const shelfH = h * 0.04;
  const sideT = w * 0.06;
  const woodColor = darkAccent(color);

  return (
    <group>
      {/* Side walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - sideT / 2), h / 2, 0]} material={itemMaterial(woodColor, 0.55, 0.02)}>
          <boxGeometry args={[sideT, h, d]} />
        </mesh>
      ))}
      {/* Top */}
      <mesh position={[0, h - shelfH / 2, 0]} material={itemMaterial(woodColor, 0.5, 0.03)}>
        <boxGeometry args={[w, shelfH, d]} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, shelfH / 2, 0]} material={itemMaterial(woodColor, 0.5, 0.03)}>
        <boxGeometry args={[w, shelfH, d]} />
      </mesh>
      {/* Shelves */}
      {Array.from({ length: shelfCount - 1 }, (_, i) => (
        <mesh
          key={`shelf-${i}`}
          position={[0, h * ((i + 1) / shelfCount), 0]}
          material={itemMaterial(woodColor, 0.5, 0.03)}
        >
          <boxGeometry args={[w - sideT * 2, shelfH * 0.8, d * 0.9]} />
        </mesh>
      ))}
      {/* Back panel */}
      <mesh position={[0, h / 2, -d * 0.42]} material={itemMaterial(woodColor, 0.7, 0.01)}>
        <boxGeometry args={[w - sideT * 2, h - shelfH * 2, d * 0.06]} />
      </mesh>
    </group>
  );
}

function FridgeGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const bodyColor = "#d4d4d8";

  return (
    <group>
      {/* Main body */}
      <RoundedBox args={[w * 0.94, h * 0.94, d * 0.94]} radius={0.06} position={[0, h / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color(bodyColor)} roughness={0.25} metalness={0.6} />
      </RoundedBox>
      {/* Door split line — freezer / fridge */}
      <mesh position={[0, h * 0.68, d * 0.48]} material={itemMaterial("#71717a", 0.3, 0.5)}>
        <boxGeometry args={[w * 0.88, h * 0.008, 0.015]} />
      </mesh>
      {/* Handles */}
      {[1, -0.5].map((yFrac, i) => (
        <mesh key={i} position={[w * 0.46, h * (i === 0 ? 0.80 : 0.42), d * 0.1]} material={itemMaterial("#a1a1aa", 0.3, 0.6)}>
          <boxGeometry args={[0.06, h * 0.12, d * 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

function DresserGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const drawerCount = 3;
  const drawerH = h * 0.06;
  const woodColor = darkAccent(color);

  return (
    <group>
      {/* Body */}
      <RoundedBox args={[w, h, d]} radius={0.05} position={[0, h / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color(color)} roughness={0.45} metalness={0.06} />
      </RoundedBox>
      {/* Top surface — slightly lighter */}
      <mesh position={[0, h - 0.02, 0]} material={itemMaterial(color, 0.4, 0.08)}>
        <boxGeometry args={[w * 1.02, 0.04, d * 1.02]} />
      </mesh>
      {/* Drawer lines */}
      {Array.from({ length: drawerCount - 1 }, (_, i) => (
        <mesh
          key={i}
          position={[0, h * ((i + 1) / drawerCount), d * 0.48]}
          material={itemMaterial(woodColor, 0.6, 0.02)}
        >
          <boxGeometry args={[w * 0.85, drawerH * 0.4, 0.015]} />
        </mesh>
      ))}
      {/* Drawer handles */}
      {Array.from({ length: drawerCount }, (_, i) => (
        <mesh
          key={`handle-${i}`}
          position={[0, h * ((i + 0.5) / drawerCount), d * 0.48]}
          material={itemMaterial("#a1a1aa", 0.35, 0.5)}
        >
          <boxGeometry args={[w * 0.18, drawerH * 0.5, d * 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

function DeskGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const topH = h * 0.1;
  const legH = h - topH;
  const woodColor = darkAccent(color);

  return (
    <group>
      {/* Tabletop */}
      <RoundedBox args={[w, topH, d]} radius={0.06} position={[0, h - topH / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color(color)} roughness={0.45} metalness={0.06} />
      </RoundedBox>
      {/* Side panels as legs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - w * 0.08), legH / 2, 0]} material={itemMaterial(woodColor, 0.55, 0.03)}>
          <boxGeometry args={[w * 0.04, legH, d * 0.88]} />
        </mesh>
      ))}
      {/* Modesty panel */}
      <mesh position={[0, legH * 0.55, -d * 0.42]} material={itemMaterial(woodColor, 0.6, 0.02)}>
        <boxGeometry args={[w * 0.88, h * 0.25, d * 0.04]} />
      </mesh>
    </group>
  );
}

function LampGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const poleR = Math.min(w, d) * 0.1;
  const baseH = h * 0.08;

  return (
    <group>
      {/* Base */}
      <mesh position={[0, baseH / 2, 0]}>
        <cylinderGeometry args={[w * 0.22, w * 0.28, baseH, 16]} />
        <meshStandardMaterial color={new THREE.Color(darkAccent(color))} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, h * 0.5, 0]} material={itemMaterial("#a1a1aa", 0.35, 0.55)}>
        <cylinderGeometry args={[poleR, poleR, h * 0.7, 8]} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, h * 0.82, 0]} material={itemMaterial(color, 0.6, 0.02)}>
        <cylinderGeometry args={[w * 0.3, w * 0.22, h * 0.22, 16]} />
      </mesh>
    </group>
  );
}

function BoxItemGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  return (
    <group>
      {/* Box body */}
      <RoundedBox args={[w * 0.94, h * 0.94, d * 0.94]} radius={0.04} position={[0, h / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color("#c4a56e")} roughness={0.75} metalness={0.0} />
      </RoundedBox>
      {/* Tape line across top */}
      <mesh position={[0, h - 0.02, 0]} material={itemMaterial("#d4c4a0", 0.5, 0.02)}>
        <boxGeometry args={[w * 0.7, 0.015, d * 0.92]} />
      </mesh>
      {/* Side tape */}
      <mesh position={[0, h / 2, d * 0.47]} material={itemMaterial("#d4c4a0", 0.5, 0.02)}>
        <boxGeometry args={[w * 0.7, d * 0.9, 0.015]} />
      </mesh>
      {/* Label */}
      <mesh position={[0, h * 0.55, d * 0.47]} material={itemMaterial(color, 0.85, 0.0)}>
        <boxGeometry args={[w * 0.25, h * 0.15, 0.02]} />
      </mesh>
    </group>
  );
}

function BicycleGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const wheelR = h * 0.35;
  const frameR = Math.min(w, d) * 0.04;

  return (
    <group>
      {/* Two wheels */}
      {[-1, 1].map((s, i) => (
        <group key={i} position={[0, wheelR, s * (d * 0.35)]}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[wheelR, wheelR * 0.12, 8, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.05} />
          </mesh>
          {/* Spokes — simple disc */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelR * 0.85, wheelR * 0.85, wheelR * 0.04, 16]} />
            <meshStandardMaterial color="#a1a1aa" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Frame tubes */}
      <mesh position={[0, h * 0.5, 0]} material={itemMaterial(color, 0.3, 0.55)}>
        <cylinderGeometry args={[frameR, frameR, d * 0.7, 8]} />
      </mesh>
      {/* Handlebars */}
      <mesh position={[0, h * 0.78, -d * 0.28]} material={itemMaterial("#333", 0.3, 0.6)}>
        <boxGeometry args={[w * 0.35, frameR * 1.5, frameR * 1.5]} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, h * 0.68, d * 0.2]} material={itemMaterial("#222", 0.6, 0.1)}>
        <boxGeometry args={[w * 0.12, h * 0.06, d * 0.12]} />
      </mesh>
      {/* Pedal crank */}
      <mesh position={[0, h * 0.25, 0]} material={itemMaterial("#444", 0.3, 0.6)}>
        <cylinderGeometry args={[frameR * 1.2, frameR * 1.2, w * 0.2, 8]} />
      </mesh>
    </group>
  );
}

function TVStandGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  const woodColor = darkAccent(color);

  return (
    <group>
      {/* Body */}
      <RoundedBox args={[w, h, d]} radius={0.05} position={[0, h / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color(color)} roughness={0.45} metalness={0.06} />
      </RoundedBox>
      {/* Top surface */}
      <mesh position={[0, h - 0.02, 0]} material={itemMaterial(color, 0.38, 0.08)}>
        <boxGeometry args={[w * 1.02, 0.04, d * 1.02]} />
      </mesh>
      {/* Center shelf cutout divider */}
      <mesh position={[0, h * 0.42, 0]} material={itemMaterial(woodColor, 0.5, 0.03)}>
        <boxGeometry args={[w * 0.88, h * 0.04, d * 0.08]} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
// Dispatch: match label → geometry component
// ═══════════════════════════════════════════════════════════════

type ItemProps = { dimensions: [number, number, number]; color: string };

const GEOMETRY_MAP: Record<string, React.FC<ItemProps>> = {
  sofa: SofaGeometry,
  sectional: SofaGeometry,
  couch: SofaGeometry,
  bed: BedGeometry,
  mattress: BedGeometry,
  "bed frame": BedGeometry,
  "dining table": TableGeometry,
  table: TableGeometry,
  "coffee table": TableGeometry,
  desk: DeskGeometry,
  "dining chair": ChairGeometry,
  chair: ChairGeometry,
  stool: ChairGeometry,
  "office chair": ChairGeometry,
  bookshelf: BookshelfGeometry,
  bookcase: BookshelfGeometry,
  refrigerator: FridgeGeometry,
  fridge: FridgeGeometry,
  dresser: DresserGeometry,
  nightstand: DresserGeometry,
  "tv stand": TVStandGeometry,
  "tool chest": DresserGeometry,
  lamp: LampGeometry,
  bicycle: BicycleGeometry,
  bike: BicycleGeometry,
  box: BoxItemGeometry,
  bin: BoxItemGeometry,
  suitcase: BoxItemGeometry,
};

export function getFurnitureComponent(label: string): React.FC<ItemProps> | null {
  const lower = label.toLowerCase();
  // Longest match first to avoid "office chair" matching "chair" before "office chair"
  const keys = Object.keys(GEOMETRY_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return GEOMETRY_MAP[key];
  }
  return null;
}

// Default: rounded box with subtle edge details — still better than a flat box
function DefaultGeometry({ dimensions: [w, h, d], color }: { dimensions: [number, number, number]; color: string }) {
  return (
    <group>
      <RoundedBox args={[w * 0.94, h * 0.94, d * 0.94]} radius={0.06} position={[0, h / 2, 0]}>
        <meshStandardMaterial color={new THREE.Color(color)} roughness={0.5} metalness={0.08} />
      </RoundedBox>
      {/* Edge highlight lines — subtle */}
      {[0.3, 0.7].map((yFrac) => (
        <mesh key={`line-${yFrac}`} position={[0, h * yFrac, d * 0.47]} material={itemMaterial(darkAccent(color), 0.7, 0.0)}>
          <boxGeometry args={[w * 0.8, h * 0.015, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main export: renders the right geometry for an item
// ═══════════════════════════════════════════════════════════════

export function FurnitureGeometry({
  label,
  dimensions,
  color,
}: {
  label: string;
  dimensions: [number, number, number];
  color: string;
}) {
  const Component = useMemo(() => getFurnitureComponent(label), [label]);

  if (Component) {
    return <Component dimensions={dimensions} color={color} />;
  }

  return <DefaultGeometry dimensions={dimensions} color={color} />;
}
