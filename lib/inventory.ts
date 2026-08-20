// Furniture inventory helpers.
// Cubic footage comes from the canonical furniture size table in
// lib/furniture.ts (real packed dimensions → derived cu ft).
import {
  getFurnitureSpec,
  type FurnitureSpec,
} from "@/lib/furniture";

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

/** Default cu ft for items that aren't in the furniture table. */
export const DEFAULT_CUFT = 15;

export function getCuFt(itemName: string): number {
  const spec = getFurnitureSpec(itemName);
  if (spec) return spec.cuFt;

  console.warn(`No cu ft data for item: ${itemName}, defaulting to ${DEFAULT_CUFT}`);
  return DEFAULT_CUFT;
}

/** The furniture spec (label + packed dimensions + cu ft) for an item. */
export function getFurnitureForItem(itemName: string): FurnitureSpec | null {
  return getFurnitureSpec(itemName);
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

