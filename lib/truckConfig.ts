import type { TruckConfig, TruckLoadItem } from "@/types";

export const TRUCK_26FT: TruckConfig = {
  name: "26' Box Truck",
  length: 26,
  width: 8,
  height: 9,
  maxCuFt: 1872,
  cargoStartZ: 7,     // cab takes ~7ft, cargo starts behind it
  cargoLength: 19,    // ~19ft of actual cargo space
  modelPath: "/models/box-truck.obj",
  modelMtlPath: "/models/box-truck.mtl",
  modelScale: 3.0,
};

export const TRUCK_53FT: TruckConfig = {
  name: "53' Tractor Trailer",
  length: 53,
  width: 8.5,
  height: 9,
  maxCuFt: 4054,
  modelPath: "/models/53ft-trailer.glb",
  modelScale: 1.0,
};

export const ROOM_COLORS: Record<string, string> = {
  Bedroom: "#7c3aed",           // violet
  "Living Room": "#76ff03",     // green
  Kitchen: "#76ff03",           // brand lime
  Office: "#f59e0b",            // amber
  "Garage / Storage": "#f97316", // orange
  Other: "#a78bfa",             // lavender
};

export function getItemCategory(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("sofa") || lower.includes("sectional") || lower.includes("couch")) return "sofa";
  if (lower.includes("bed") || lower.includes("mattress")) return "bed";
  if (lower.includes("table")) return "table";
  if (lower.includes("desk")) return "desk";
  if (lower.includes("chair") || lower.includes("stool")) return "chair";
  if (lower.includes("bookshelf") || lower.includes("bookcase")) return "bookshelf";
  if (lower.includes("refrigerator") || lower.includes("fridge")) return "fridge";
  if (lower.includes("dresser") || lower.includes("nightstand")) return "dresser";
  if (lower.includes("tv stand")) return "tvStand";
  if (lower.includes("tool chest")) return "dresser";
  if (lower.includes("lamp")) return "lamp";
  if (lower.includes("bicycle") || lower.includes("bike")) return "bicycle";
  if (lower.includes("box") || lower.includes("bin") || lower.includes("suitcase")) return "box";
  return "other";
}

export function computeBoxDimensions(cuFt: number, label: string): [number, number, number] {
  const lower = label.toLowerCase();

  // Flat items (mattresses, rugs)
  if (lower.includes("mattress") || lower.includes("rug")) {
    const w = Math.sqrt(cuFt / 0.5);
    return [w, 0.5, w];
  }

  // Tall items (bookshelves, wardrobes, fridges)
  if (lower.includes("bookshelf") || lower.includes("wardrobe") || lower.includes("refrigerator") || lower.includes("fridge")) {
    const base = Math.sqrt(cuFt / 3);
    return [base, 3, base];
  }

  // Long items (sofa, bed frame)
  if (lower.includes("sofa") || lower.includes("bed frame") || lower.includes("sectional")) {
    return [Math.sqrt(cuFt * 1.8), 1.5, Math.sqrt(cuFt / 1.8)];
  }

  // Chairs, stools
  if (lower.includes("chair") || lower.includes("stool")) {
    return [Math.sqrt(cuFt / 2), 2, Math.sqrt(cuFt / 2)];
  }

  // Boxes
  if (lower.includes("box") || lower.includes("bin")) {
    return [Math.sqrt(cuFt / 1.5), 1.5, Math.sqrt(cuFt / 1.5)];
  }

  // Default: cube root
  const side = Math.cbrt(cuFt);
  return [side, side, side];
}

export function computeItemPositions(
  items: TruckLoadItem[],
  config: TruckConfig
): (TruckLoadItem & { position: [number, number, number] })[] {
  const sorted = [...items].sort((a, b) => b.cuFt - a.cuFt);

  const positioned: (TruckLoadItem & { position: [number, number, number] })[] = [];
  const startZ = config.cargoStartZ ?? 0;
  const maxZ = startZ + (config.cargoLength ?? config.length);

  let x = 0, y = 0, z = startZ;
  let rowHeight = 0;
  let rowDepth = 0;

  for (const item of sorted) {
    const [w, h, d] = item.dimensions;

    if (x + w > config.width) {
      x = 0;
      z += rowDepth + 0.5;
      rowDepth = 0;
      rowHeight = 0;
    }

    if (y + h > config.height) {
      y = 0;
      x += w;
    }

    if (z + d > maxZ) break;

    positioned.push({
      ...item,
      position: [x + w / 2 - config.width / 2, y + h / 2, z + d / 2],
    });

    rowHeight = Math.max(rowHeight, h);
    rowDepth = Math.max(rowDepth, d);
    y += h;
  }

  return positioned;
}

export function generateDemoInventory(): TruckLoadItem[] {
  return [
    { id: "demo-1", label: "Queen Bed", cuFt: 60, dimensions: [4, 2.5, 3], color: ROOM_COLORS["Bedroom"], room: "Bedroom" },
    { id: "demo-2", label: "Dresser", cuFt: 40, dimensions: [3.5, 3, 2], color: ROOM_COLORS["Bedroom"], room: "Bedroom" },
    { id: "demo-3", label: "Nightstand", cuFt: 10, dimensions: [1.5, 2, 1.5], color: ROOM_COLORS["Bedroom"], room: "Bedroom" },
    { id: "demo-4", label: "Sofa (3-Seat)", cuFt: 60, dimensions: [6, 3, 2.5], color: ROOM_COLORS["Living Room"], room: "Living Room" },
    { id: "demo-5", label: "Coffee Table", cuFt: 15, dimensions: [3, 1.5, 2], color: ROOM_COLORS["Living Room"], room: "Living Room" },
    { id: "demo-6", label: "TV Stand", cuFt: 20, dimensions: [3, 2, 1.5], color: ROOM_COLORS["Living Room"], room: "Living Room" },
    { id: "demo-7", label: "Bookshelf", cuFt: 30, dimensions: [2.5, 5, 1.5], color: ROOM_COLORS["Living Room"], room: "Living Room" },
    { id: "demo-8", label: "Dining Table", cuFt: 35, dimensions: [4, 2.5, 2.5], color: ROOM_COLORS["Kitchen"], room: "Kitchen" },
    { id: "demo-9", label: "Refrigerator", cuFt: 65, dimensions: [3, 5.5, 2.5], color: ROOM_COLORS["Kitchen"], room: "Kitchen" },
    { id: "demo-10", label: "Dining Chair", cuFt: 8, dimensions: [1.5, 2.5, 1.5], color: ROOM_COLORS["Kitchen"], room: "Kitchen" },
    { id: "demo-11", label: "Desk", cuFt: 30, dimensions: [4, 2.5, 2], color: ROOM_COLORS["Office"], room: "Office" },
    { id: "demo-12", label: "Office Chair", cuFt: 18, dimensions: [2, 3, 2], color: ROOM_COLORS["Office"], room: "Office" },
    { id: "demo-13", label: "Box (Large)", cuFt: 4.5, dimensions: [1.5, 1.5, 1.5], color: ROOM_COLORS["Other"], room: "Other" },
    { id: "demo-14", label: "Box (Medium)", cuFt: 3, dimensions: [1.2, 1.2, 1.2], color: ROOM_COLORS["Other"], room: "Other" },
    { id: "demo-15", label: "Box (Medium)", cuFt: 3, dimensions: [1.2, 1.2, 1.2], color: ROOM_COLORS["Other"], room: "Other" },
    { id: "demo-16", label: "Box (Small)", cuFt: 1.5, dimensions: [1, 1, 1], color: ROOM_COLORS["Other"], room: "Other" },
    { id: "demo-17", label: "Lamp", cuFt: 5, dimensions: [1, 2.5, 1], color: ROOM_COLORS["Other"], room: "Other" },
    { id: "demo-18", label: "Suitcase", cuFt: 8, dimensions: [2, 1.5, 1.5], color: ROOM_COLORS["Other"], room: "Other" },
    { id: "demo-19", label: "Tool Chest", cuFt: 20, dimensions: [2.5, 3, 1.5], color: ROOM_COLORS["Garage / Storage"], room: "Garage / Storage" },
    { id: "demo-20", label: "Bicycle", cuFt: 12, dimensions: [5, 3.5, 1], color: ROOM_COLORS["Garage / Storage"], room: "Garage / Storage" },
  ];
}

export function calculateFillPercentage(items: TruckLoadItem[], config: TruckConfig): number {
  const totalCuFt = items.reduce((sum, item) => sum + item.cuFt, 0);
  return Math.min(Math.round((totalCuFt / config.maxCuFt) * 100), 100);
}

// ---------------------------------------------------------------------------
// COCO_TO_INVENTORY — mapping from COCO class labels to inventory item names
// Used by scanner-web's label-map.ts for detection label normalization
// ---------------------------------------------------------------------------

export const COCO_TO_INVENTORY: Record<string, string> = {
  couch: "Sofa (3-seater)",
  chair: "Dining Chair",
  "dining table": "Dining Table",
  bed: "Queen Bed",
  refrigerator: "Refrigerator",
  tv: "TV Stand",
  bookcase: "Bookshelf",
  "potted plant": "Large Rug",
  backpack: "Large Box",
  handbag: "Small Box",
  suitcase: "Large Box",
  oven: "Stove/Oven",
  microwave: "Microwave",
  sink: "Dishwasher",
  clock: "Nightstand",
  vase: "Nightstand",
  laptop: "Desk",
};
