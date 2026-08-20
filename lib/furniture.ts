/**
 * Canonical furniture size table — the single source of truth for every
 * cubic-foot estimate in the app (landing-page quote form, scan-page
 * inventory, and the truck-packing renderer).
 *
 * Each piece lists its typical **packed/boxed dimensions in inches** —
 * i.e. the footprint it occupies in a moving truck after disassembly,
 * padding, and wrapping. Cubic footage is *derived* from those dimensions:
 *
 *     cuFt = (W × D × H) / 12³
 *
 * This keeps every estimate traceable back to a real, physical item size
 * instead of a hand-typed number.
 */

export interface FurnitureSpec {
  /** Display label, e.g. "Sofa (3-seater)" — matches ROOMS + COCO mappings */
  label: string;
  room: string;
  /** Typical packed dimensions in inches: [width, depth, height] */
  dimsInches: [number, number, number];
  /** Cubic feet computed from dimsInches — never hand-entered */
  cuFt: number;
}

const INCHES_PER_FT = 12;
const IN3_PER_FT3 = INCHES_PER_FT ** 3;

function dimsToCuFt(dims: [number, number, number]): number {
  const raw = (dims[0] * dims[1] * dims[2]) / IN3_PER_FT3;
  // Round to 1 decimal so small items read nicely (e.g. 1.3), big ones stay clean
  return Math.round(raw * 10) / 10;
}

/**
 * Normalize any label/key for lookup: lowercase, strip punctuation (but keep
 * underscores), collapse whitespace to underscores.
 * "Sofa (3-seater)" → "sofa_3seater", "sofa 3 seater" → "sofa_3_seater".
 * Both forms are handled via explicit aliases in ALIASES below.
 */
export function normalizeFurnitureKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

// Raw specs: label + room + packed dimensions (inches). cuFt is derived.
const RAW_SPECS: Array<Omit<FurnitureSpec, "cuFt">> = [

  // ── Bedroom (20) ─────────────────────────────────────────────
  { label: "Twin Bed", room: "Bedroom", dimsInches: [78, 44, 18] }, // 35.8  (frame + box spring + mattress, boxed)
  { label: "Full Bed", room: "Bedroom", dimsInches: [78, 57, 18] }, // 46.3
  { label: "Queen Bed", room: "Bedroom", dimsInches: [84, 62, 18] }, // 54.3
  { label: "King Bed", room: "Bedroom", dimsInches: [84, 78, 18] }, // 68.3
  { label: "Cal King Bed", room: "Bedroom", dimsInches: [86, 74, 18] }, // 66.3
  { label: "Bunk Bed", room: "Bedroom", dimsInches: [82, 44, 22] }, // 45.9  (two frames + rails + ladder, boxed)
  { label: "Crib", room: "Bedroom", dimsInches: [54, 31, 24] }, // 23.3  (folded, with mattress)
  { label: "Dresser", room: "Bedroom", dimsInches: [60, 20, 36] }, // 25
  { label: "Chest of Drawers", room: "Bedroom", dimsInches: [42, 20, 52] }, // 25.3
  { label: "Nightstand", room: "Bedroom", dimsInches: [24, 18, 26] }, // 6.5
  { label: "Wardrobe", room: "Bedroom", dimsInches: [48, 22, 70] }, // 42.8
  { label: "Armoire", room: "Bedroom", dimsInches: [48, 26, 72] }, // 52
  { label: "Vanity", room: "Bedroom", dimsInches: [36, 18, 30] }, // 11.3
  { label: "Bed Frame", room: "Bedroom", dimsInches: [76, 24, 12] }, // 12.7
  { label: "Mattress (Twin)", room: "Bedroom", dimsInches: [78, 39, 10] }, // 17.6
  { label: "Mattress (Full)", room: "Bedroom", dimsInches: [78, 54, 10] }, // 24.4
  { label: "Mattress (Queen)", room: "Bedroom", dimsInches: [84, 60, 10] }, // 29.2
  { label: "Mattress (King)", room: "Bedroom", dimsInches: [84, 76, 10] }, // 36.9
  { label: "Mattress (Cal King)", room: "Bedroom", dimsInches: [86, 72, 10] }, // 35.8
  { label: "Hope Chest", room: "Bedroom", dimsInches: [42, 20, 22] }, // 10.7

  // ── Living Room (16) ─────────────────────────────────────────
  { label: "Sofa (3-seater)", room: "Living Room", dimsInches: [86, 38, 34] }, // 64.3
  { label: "Sofa (2-seater)", room: "Living Room", dimsInches: [68, 38, 34] }, // 50.8
  { label: "Sectional Sofa", room: "Living Room", dimsInches: [110, 60, 36] }, // 137.5
  { label: "Loveseat", room: "Living Room", dimsInches: [62, 36, 33] }, // 42.6
  { label: "Recliner", room: "Living Room", dimsInches: [36, 38, 42] }, // 33.3
  { label: "Ottoman", room: "Living Room", dimsInches: [30, 24, 18] }, // 7.5
  { label: "Coffee Table", room: "Living Room", dimsInches: [48, 24, 18] }, // 12
  { label: "End Table", room: "Living Room", dimsInches: [24, 24, 22] }, // 7.3
  { label: "TV Stand", room: "Living Room", dimsInches: [60, 18, 24] }, // 15
  { label: "Media Console", room: "Living Room", dimsInches: [52, 18, 20] }, // 10.8
  { label: "Entertainment Center", room: "Living Room", dimsInches: [72, 20, 60] }, // 50
  { label: "Bookshelf", room: "Living Room", dimsInches: [36, 14, 72] }, // 21
  { label: "Armchair", room: "Living Room", dimsInches: [32, 32, 36] }, // 21.3
  { label: "Floor Lamp", room: "Living Room", dimsInches: [14, 14, 62] }, // 7
  { label: "Floor Rug", room: "Living Room", dimsInches: [96, 12, 12] }, // 8 (rolled)
  { label: "Large Rug", room: "Living Room", dimsInches: [120, 14, 14] }, // 13.6 (rolled)

  // ── Kitchen (11) ─────────────────────────────────────────────
  { label: "Dining Table", room: "Kitchen", dimsInches: [60, 36, 30] }, // 37.5
  { label: "Dining Chair", room: "Kitchen", dimsInches: [20, 22, 36] }, // 9.2
  { label: "Bar Stool", room: "Kitchen", dimsInches: [16, 16, 30] }, // 4.4
  { label: "Refrigerator", room: "Kitchen", dimsInches: [36, 30, 70] }, // 43.8
  { label: "Freezer Chest", room: "Kitchen", dimsInches: [40, 28, 36] }, // 23.3
  { label: "Microwave", room: "Kitchen", dimsInches: [21, 16, 13] }, // 2.5
  { label: "Dishwasher", room: "Kitchen", dimsInches: [24, 25, 35] }, // 12.2
  { label: "Stove/Oven", room: "Kitchen", dimsInches: [30, 28, 38] }, // 18.5
  { label: "Toaster Oven", room: "Kitchen", dimsInches: [18, 12, 10] }, // 1.3
  { label: "Kitchen Island", room: "Kitchen", dimsInches: [48, 30, 36] }, // 30
  { label: "Wine Rack", room: "Kitchen", dimsInches: [24, 12, 36] }, // 6

  // ── Office (9) ───────────────────────────────────────────────
  { label: "Desk", room: "Office", dimsInches: [60, 30, 30] }, // 31.3
  { label: "Standing Desk", room: "Office", dimsInches: [48, 30, 48] }, // 40
  { label: "Office Chair", room: "Office", dimsInches: [26, 26, 45] }, // 17.6
  { label: "Filing Cabinet", room: "Office", dimsInches: [18, 24, 52] }, // 13
  { label: "Bookshelf (Small)", room: "Office", dimsInches: [30, 12, 48] }, // 10
  { label: "Monitor", room: "Office", dimsInches: [26, 10, 20] }, // 3
  { label: "Printer", room: "Office", dimsInches: [18, 16, 10] }, // 1.7
  { label: "Shredder", room: "Office", dimsInches: [14, 10, 18] }, // 1.5
  { label: "Whiteboard", room: "Office", dimsInches: [48, 4, 36] }, // 4

  // ── Garage (10) ──────────────────────────────────────────────
  { label: "Workbench", room: "Garage", dimsInches: [60, 30, 36] }, // 37.5
  { label: "Tool Chest", room: "Garage", dimsInches: [40, 18, 40] }, // 16.7
  { label: "Toolbox (Large)", room: "Garage", dimsInches: [30, 12, 12] }, // 2.5
  { label: "Bicycle", room: "Garage", dimsInches: [68, 14, 42] }, // 23.1 (boxed)
  { label: "Ladder", room: "Garage", dimsInches: [96, 20, 5] }, // 5.6
  { label: "Lawn Mower", room: "Garage", dimsInches: [40, 24, 24] }, // 13.3
  { label: "Snowblower", room: "Garage", dimsInches: [50, 30, 40] }, // 34.7
  { label: "Christmas Tree Box", room: "Garage", dimsInches: [60, 20, 20] }, // 13.9
  { label: "Storage Bin (Large)", room: "Garage", dimsInches: [24, 18, 14] }, // 3.5
  { label: "Storage Bin (Medium)", room: "Garage", dimsInches: [18, 12, 12] }, // 1.5

  // ── Bathroom (3) ─────────────────────────────────────────────
  { label: "Bathroom Vanity", room: "Bathroom", dimsInches: [36, 21, 32] }, // 14
  { label: "Medicine Cabinet", room: "Bathroom", dimsInches: [20, 5, 28] }, // 1.6
  { label: "Laundry Basket", room: "Bathroom", dimsInches: [22, 15, 14] }, // 2.7

  // ── Other (13) ───────────────────────────────────────────────
  { label: "Large Box", room: "Other", dimsInches: [18, 18, 18] }, // 3.4
  { label: "Medium Box", room: "Other", dimsInches: [16, 16, 16] }, // 2.4
  { label: "Small Box", room: "Other", dimsInches: [12, 12, 12] }, // 1
  { label: "Suitcase", room: "Other", dimsInches: [28, 20, 12] }, // 3.9
  { label: "Mirror (Large)", room: "Other", dimsInches: [48, 4, 38] }, // 4.2
  { label: "Plant (Large)", room: "Other", dimsInches: [22, 22, 48] }, // 13.4
  { label: "Vacuum Cleaner", room: "Other", dimsInches: [14, 14, 46] }, // 5.2
  { label: "Ironing Board", room: "Other", dimsInches: [16, 5, 56] }, // 2.6
  { label: "Pet Crate (Large)", room: "Other", dimsInches: [42, 28, 30] }, // 20.4
  { label: "Pet Crate (Small)", room: "Other", dimsInches: [24, 18, 20] }, // 5
  { label: "Ceiling Fan", room: "Other", dimsInches: [20, 20, 16] }, // 3.7
  { label: "Dehumidifier", room: "Other", dimsInches: [14, 12, 22] }, // 2.1
  { label: "Bench", room: "Other", dimsInches: [48, 16, 18] }, // 8
];

/** Fully-resolved specs with derived cuFt — export for display/tests */
export const FURNITURE_SPECS: FurnitureSpec[] = RAW_SPECS.map((s) => ({
  ...s,
  cuFt: dimsToCuFt(s.dimsInches),
}));

const LABEL_MAP: Map<string, FurnitureSpec> = new Map(
  FURNITURE_SPECS.map((s) => [normalizeFurnitureKey(s.label), s]),
);

// Aliases: legacy snake_case keys from the old table + COCO classes + common
// alternate names. Each resolves to a canonical spec label.
const ALIASES: Record<string, string> = {
  // Legacy keys from the previous CUBIC_FOOTAGE table
  twin_bed: "Twin Bed",
  full_bed: "Full Bed",
  queen_bed: "Queen Bed",
  king_bed: "King Bed",
  cal_king_bed: "Cal King Bed",
  bunk_bed: "Bunk Bed",
  crib: "Crib",
  dresser: "Dresser",
  chest_of_drawers: "Chest of Drawers",
  nightstand: "Nightstand",
  wardrobe: "Wardrobe",
  armoire: "Armoire",
  vanity: "Vanity",
  bed_frame: "Bed Frame",
  mattress_twin: "Mattress (Twin)",
  mattress_full: "Mattress (Full)",
  mattress_queen: "Mattress (Queen)",
  mattress_king: "Mattress (King)",
  mattress_cal_king: "Mattress (Cal King)",
  hope_chest: "Hope Chest",
  sofa_3seater: "Sofa (3-seater)",
  sofa_3_seater: "Sofa (3-seater)",
  sofa_2seater: "Sofa (2-seater)",
  sofa_2_seater: "Sofa (2-seater)",
  sectional: "Sectional Sofa",
  loveseat: "Loveseat",
  recliner: "Recliner",
  ottoman: "Ottoman",
  coffee_table: "Coffee Table",
  end_table: "End Table",
  tv_stand: "TV Stand",
  media_console: "Media Console",
  entertainment_center: "Entertainment Center",
  bookshelf: "Bookshelf",
  armchair: "Armchair",
  floor_lamp: "Floor Lamp",
  floor_rug: "Floor Rug",
  rug_large: "Large Rug",
  large_rug: "Large Rug",
  dining_table: "Dining Table",
  dining_chair: "Dining Chair",
  bar_stool: "Bar Stool",
  refrigerator: "Refrigerator",
  freezer_chest: "Freezer Chest",
  microwave: "Microwave",
  dishwasher: "Dishwasher",
  stove_oven: "Stove/Oven",
  stoveoven: "Stove/Oven",
  toaster_oven: "Toaster Oven",
  kitchen_island: "Kitchen Island",
  wine_rack: "Wine Rack",
  desk: "Desk",
  standing_desk: "Standing Desk",
  office_chair: "Office Chair",
  filing_cabinet: "Filing Cabinet",
  bookshelf_small: "Bookshelf (Small)",
  monitor: "Monitor",
  printer: "Printer",
  shredder: "Shredder",
  whiteboard: "Whiteboard",
  workbench: "Workbench",
  tool_chest: "Tool Chest",
  toolbox_large: "Toolbox (Large)",
  bicycle: "Bicycle",
  ladder: "Ladder",
  lawn_mower: "Lawn Mower",
  snowblower: "Snowblower",
  christmas_tree: "Christmas Tree Box",
  christmas_tree_box: "Christmas Tree Box",
  storage_bin_large: "Storage Bin (Large)",
  storage_bin_medium: "Storage Bin (Medium)",
  bathroom_vanity: "Bathroom Vanity",
  medicine_cabinet: "Medicine Cabinet",
  laundry_basket: "Laundry Basket",
  box_large: "Large Box",
  box_medium: "Medium Box",
  box_small: "Small Box",
  suitcase: "Suitcase",
  mirror_large: "Mirror (Large)",
  plant_large: "Plant (Large)",
  vacuum: "Vacuum Cleaner",
  vacuum_cleaner: "Vacuum Cleaner",
  ironing_board: "Ironing Board",
  pet_crate_large: "Pet Crate (Large)",
  pet_crate_small: "Pet Crate (Small)",
  ceiling_fan: "Ceiling Fan",
  dehumidifier: "Dehumidifier",
  bench: "Bench",

  // COCO detection classes / common names
  couch: "Sofa (3-seater)",
  sofa: "Sofa (3-seater)",
  chair: "Dining Chair",
  bed: "Queen Bed",
  tv: "TV Stand",
  bookcase: "Bookshelf",
  fridge: "Refrigerator",
  oven: "Stove/Oven",
  sink: "Dishwasher",
  "potted plant": "Plant (Large)",
  plant: "Plant (Large)",
  vase: "Nightstand",
  clock: "Nightstand",
  backpack: "Large Box",
  handbag: "Small Box",
  laptop: "Desk",
  keyboard: "Monitor",
  umbrella: "Floor Lamp",
  bottle: "Small Box",
  "wine glass": "Wine Rack",
  cup: "Small Box",
  bowl: "Small Box",
  toaster: "Toaster Oven",
};

const ALIAS_MAP: Map<string, FurnitureSpec> = new Map(
  Object.entries(ALIASES).flatMap(([key, label]) => {
    const spec = LABEL_MAP.get(normalizeFurnitureKey(label));
    return spec ? [[normalizeFurnitureKey(key), spec]] : [];
  }),
);

/**
 * Resolve any label (display label, legacy key, or COCO class) to its spec.
 * Returns null for unknown items.
 */
export function getFurnitureSpec(input: string): FurnitureSpec | null {
  const key = normalizeFurnitureKey(input);
  return LABEL_MAP.get(key) ?? ALIAS_MAP.get(key) ?? null;
}

/** Cubic feet for a label/key, or null when the item is not in the table. */
export function getFurnitureCuFt(input: string): number | null {
  return getFurnitureSpec(input)?.cuFt ?? null;
}

/** All canonical display labels (for tests / UI catalogs). */
export const ALL_FURNITURE_LABELS: string[] = FURNITURE_SPECS.map(
  (s) => s.label,
);

