// Cubic footage lookup table per furniture item.
// Keys use underscore format for normalization in getCuFt().
const CUBIC_FOOTAGE: Record<string, number> = {
  // Bedroom
  queen_bed: 60,
  king_bed: 75,
  twin_bed: 40,
  dresser: 25,
  nightstand: 8,
  wardrobe: 40,
  mattress_queen: 35,
  mattress_king: 45,
  mattress_twin: 20,
  // Living Room
  sofa_3seater: 50,
  sofa_2seater: 35,
  loveseat: 30,
  coffee_table: 10,
  tv_stand: 15,
  bookshelf: 20,
  armchair: 18,
  rug_large: 5,
  // Kitchen
  dining_table: 25,
  dining_chair: 5,
  refrigerator: 40,
  microwave: 3,
  dishwasher: 15,
  stove_oven: 20,
  // Office
  desk: 20,
  office_chair: 12,
  filing_cabinet: 15,
  // Garage
  toolbox_large: 15,
  bicycle: 12,
  ladder: 8,
  lawn_mower: 15,
  // Other
  box_large: 4,
  box_medium: 3,
  box_small: 2,
  large_rug: 5,
};

export const ROOMS: Record<string, string[]> = {
  Bedroom: [
    "Queen Bed", "King Bed", "Twin Bed",
    "Dresser", "Nightstand", "Wardrobe",
    "Mattress (Queen)", "Mattress (King)", "Mattress (Twin)",
  ],
  "Living Room": [
    "Sofa (3-seater)", "Sofa (2-seater)", "Loveseat",
    "Coffee Table", "TV Stand", "Bookshelf",
    "Armchair", "Large Rug",
  ],
  Kitchen: [
    "Dining Table", "Dining Chair", "Refrigerator",
    "Microwave", "Dishwasher", "Stove/Oven",
  ],
  Office: [
    "Desk", "Office Chair", "Filing Cabinet", "Bookshelf",
  ],
  Garage: [
    "Toolbox (Large)", "Bicycle", "Ladder", "Lawn Mower",
  ],
  Other: [
    "Large Box", "Medium Box", "Small Box",
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
