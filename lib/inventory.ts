// Cubic footage lookup for common household items
export const CUBIC_FOOTAGE: Record<string, number> = {
  // Bedroom
  "Queen Bed": 60,
  "King Bed": 70,
  "Twin Bed": 40,
  "Dresser": 40,
  "Nightstand": 10,
  "Wardrobe": 55,
  "Mattress (Queen)": 35,
  "Mattress (King)": 45,
  "Bed Frame": 25,
  "Vanity": 20,
  // Living Room
  "Sofa (3-Seat)": 60,
  "Sofa (2-Seat)": 45,
  "Sectional": 100,
  "Coffee Table": 15,
  "TV Stand": 20,
  "Bookshelf": 30,
  "Recliner": 30,
  "Armchair": 25,
  "TV (55\"+)": 12,
  "Rug (Large)": 15,
  // Kitchen
  "Dining Table": 35,
  "Dining Chair": 8,
  "Refrigerator": 65,
  "Microwave": 5,
  "Dishwasher": 18,
  "Stove/Oven": 30,
  "Kitchen Island": 25,
  "Bar Stool": 8,
  // Office
  "Desk": 30,
  "Office Chair": 18,
  "Filing Cabinet": 15,
  "Bookshelf (Small)": 20,
  "Monitor": 5,
  "Printer": 8,
  // Garage / Storage
  "Tool Chest": 20,
  "Workbench": 25,
  "Lawn Mower": 15,
  "Bicycle": 12,
  "Storage Bin (Large)": 8,
  "Storage Bin (Medium)": 5,
  // Other
  "Box (Large)": 4.5,
  "Box (Medium)": 3,
  "Box (Small)": 1.5,
  "Lamp": 5,
  "Mirror (Large)": 8,
  "Plant (Large)": 10,
  "Suitcase": 8,
};

export const ROOMS: Record<string, string[]> = {
  Bedroom: [
    "Queen Bed", "King Bed", "Twin Bed", "Dresser", "Nightstand",
    "Wardrobe", "Mattress (Queen)", "Mattress (King)", "Bed Frame", "Vanity"
  ],
  "Living Room": [
    "Sofa (3-Seat)", "Sofa (2-Seat)", "Sectional", "Coffee Table",
    "TV Stand", "Bookshelf", "Recliner", "Armchair", "TV (55\"+)", "Rug (Large)"
  ],
  Kitchen: [
    "Dining Table", "Dining Chair", "Refrigerator", "Microwave",
    "Dishwasher", "Stove/Oven", "Kitchen Island", "Bar Stool"
  ],
  Office: [
    "Desk", "Office Chair", "Filing Cabinet", "Bookshelf (Small)", "Monitor", "Printer"
  ],
  "Garage / Storage": [
    "Tool Chest", "Workbench", "Lawn Mower", "Bicycle",
    "Storage Bin (Large)", "Storage Bin (Medium)"
  ],
  Other: [
    "Box (Large)", "Box (Medium)", "Box (Small)", "Lamp", "Mirror (Large)",
    "Plant (Large)", "Suitcase"
  ],
};

export function getCuFt(itemName: string): number {
  // Exact match
  if (CUBIC_FOOTAGE[itemName]) return CUBIC_FOOTAGE[itemName];

  // Fuzzy match
  const lower = itemName.toLowerCase();
  for (const [key, value] of Object.entries(CUBIC_FOOTAGE)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return value;
    }
  }

  return 15; // default fallback
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

export function calculateTotalCuFt(items: { item: string; quantity: number }[]): number {
  return items.reduce((total, { item, quantity }) => {
    return total + getCuFt(item) * quantity;
  }, 0);
}
