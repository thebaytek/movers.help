// Cubic footage lookup table per furniture item.
// Keys use underscore format for normalization in getCuFt().
const CUBIC_FOOTAGE: Record<string, number> = {
  // ── Bedroom ──────────────────────────────────────────────
  twin_bed: 40,
  full_bed: 50,
  queen_bed: 60,
  king_bed: 75,
  cal_king_bed: 80,
  bunk_bed: 55,
  crib: 20,
  dresser: 25,
  chest_of_drawers: 30,
  nightstand: 8,
  wardrobe: 40,
  armoire: 45,
  vanity: 15,
  bed_frame: 20,
  mattress_twin: 20,
  mattress_full: 28,
  mattress_queen: 35,
  mattress_king: 45,
  mattress_cal_king: 48,
  hope_chest: 10,

  // ── Living Room ──────────────────────────────────────────
  sofa_3seater: 50,
  sofa_2seater: 35,
  sectional: 100,
  loveseat: 30,
  recliner: 30,
  ottoman: 8,
  coffee_table: 10,
  end_table: 5,
  tv_stand: 15,
  media_console: 12,
  entertainment_center: 35,
  bookshelf: 20,
  armchair: 18,
  floor_lamp: 3,
  floor_rug: 8,
  rug_large: 5,

  // ── Kitchen ──────────────────────────────────────────────
  dining_table: 25,
  dining_chair: 5,
  bar_stool: 6,
  refrigerator: 40,
  freezer_chest: 25,
  microwave: 3,
  dishwasher: 15,
  stove_oven: 20,
  stoveoven: 20,       // alias for "Stove/Oven" after normalization
  toaster_oven: 2,
  kitchen_island: 25,
  wine_rack: 8,

  // ── Office ───────────────────────────────────────────────
  desk: 20,
  standing_desk: 25,
  office_chair: 12,
  filing_cabinet: 15,
  bookshelf_small: 10,
  monitor: 5,
  printer: 6,
  shredder: 4,
  whiteboard: 6,

  // ── Garage ───────────────────────────────────────────────
  workbench: 25,
  tool_chest: 20,
  toolbox_large: 15,
  bicycle: 12,
  ladder: 8,
  lawn_mower: 15,
  snowblower: 15,
  christmas_tree: 20,
  storage_bin_large: 8,
  storage_bin_medium: 5,

  // ── Bathroom ─────────────────────────────────────────────
  bathroom_vanity: 12,
  medicine_cabinet: 4,
  laundry_basket: 3,

  // ── Other ────────────────────────────────────────────────
  box_large: 4,
  box_medium: 3,
  box_small: 2,
  large_rug: 5,
  suitcase: 8,
  mirror_large: 8,
  plant_large: 10,
  vacuum: 4,
  vacuum_cleaner: 4,
  ironing_board: 3,
  pet_crate_large: 12,
  pet_crate_small: 6,
  ceiling_fan: 6,
  dehumidifier: 4,
  bench: 8,
};

export const ROOMS: Record<string, string[]> = {
  Bedroom: [
    "Twin Bed", "Full Bed", "Queen Bed", "King Bed", "Cal King Bed",
    "Bunk Bed", "Crib",
    "Dresser", "Chest of Drawers", "Nightstand", "Wardrobe",
    "Armoire", "Vanity", "Bed Frame", "Hope Chest",
    "Mattress (Twin)", "Mattress (Full)", "Mattress (Queen)", "Mattress (King)", "Mattress (Cal King)",
  ],
  "Living Room": [
    "Sofa (3-seater)", "Sofa (2-seater)", "Sectional Sofa",
    "Loveseat", "Recliner", "Ottoman", "Coffee Table",
    "End Table", "TV Stand", "Media Console",
    "Entertainment Center", "Bookshelf", "Armchair",
    "Floor Lamp", "Floor Rug", "Large Rug",
  ],
  Kitchen: [
    "Dining Table", "Dining Chair", "Bar Stool",
    "Refrigerator", "Freezer Chest", "Microwave",
    "Dishwasher", "Stove/Oven", "Toaster Oven",
    "Kitchen Island", "Wine Rack",
  ],
  Office: [
    "Desk", "Standing Desk", "Office Chair",
    "Filing Cabinet", "Bookshelf (Small)",
    "Monitor", "Printer", "Shredder", "Whiteboard",
  ],
  Garage: [
    "Workbench", "Tool Chest", "Toolbox (Large)",
    "Bicycle", "Ladder", "Lawn Mower", "Snowblower",
    "Christmas Tree Box", "Storage Bin (Large)", "Storage Bin (Medium)",
  ],
  Bathroom: [
    "Bathroom Vanity", "Medicine Cabinet", "Laundry Basket",
  ],
  Other: [
    "Large Box", "Medium Box", "Small Box",
    "Suitcase", "Mirror (Large)", "Plant (Large)",
    "Vacuum Cleaner", "Ironing Board",
    "Pet Crate (Large)", "Pet Crate (Small)",
    "Ceiling Fan", "Dehumidifier", "Bench",
  ],
};

export function getCuFt(itemName: string): number {
  const key = itemName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();

  if (CUBIC_FOOTAGE[key] !== undefined) return CUBIC_FOOTAGE[key];

  for (const [k, v] of Object.entries(CUBIC_FOOTAGE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }

  console.warn(`No cu ft data for item: ${itemName}, defaulting to 15`);
  return 15;
}

export function getItemsForRoom(room: string): string[] {
  return ROOMS[room] || [];
}

export function getRoomForItem(itemName: string): string {
  for (const [room, items] of Object.entries(ROOMS)) {
    if (items.includes(itemName)) return room;
  }
  return "Other";
}

export function calculateTotalCuFt(
  items: { item: string; quantity: number }[],
): number {
  return items.reduce((total, { item, quantity }) => {
    return total + getCuFt(item) * quantity;
  }, 0);
}

export function calculateQuote(totalCuFt: number): number {
  const baseRate = 6.5;
  const minQuote = 500;
  const quote = Math.round(baseRate * totalCuFt);
  return Math.max(quote, minQuote);
}
