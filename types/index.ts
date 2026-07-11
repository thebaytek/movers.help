export interface InventoryItem {
  room: string;
  item: string;
  quantity: number;
  cuFtPerItem: number;
}

export interface MoveDetails {
  fromCity: string;
  fromState: string;
  toCity: string;
  toState: string;
  moveDate: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface QuoteResult {
  basePrice: number;
  distanceMiles: number;
  distanceCost: number;
  volumeCuFt: number;
  volumeCost: number;
  laborCost: number;
  seasonalMultiplier: number;
  accessibilityFee: number;
  packingFee: number;
  storageFee: number;
  subtotal: number;
  estimatedTotal: number;
  breakdown: QuoteBreakdownItem[];
}

export interface QuoteBreakdownItem {
  label: string;
  amount: number;
  description?: string;
}

export type LeadStatus = "new" | "contacted" | "quoted" | "booked" | "completed" | "closed";

export interface TruckConfig {
  name: string;
  length: number;       // total vehicle length in ft
  width: number;
  height: number;
  maxCuFt: number;
  cargoStartZ?: number; // Z offset where cargo box begins (after cab), in ft. Default 0.
  cargoLength?: number; // usable cargo box length in ft. Default = length.
  modelPath?: string;    // OBJ/GLB model in /public
  modelMtlPath?: string; // MTL material file (OBJ only)
  modelScale?: number;   // override auto-calculated scale
}

export interface TruckLoadItem {
  id: string;
  label: string;
  cuFt: number;
  dimensions: [number, number, number];
  color: string;
  room: string;
  category?: string;
}
