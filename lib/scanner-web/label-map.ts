import { COCO_TO_INVENTORY } from "@/lib/truckConfig";

export function normalizeClass(raw: string): string {
  return raw.toLowerCase().replace(/_/g, " ").trim();
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function toInventoryLabel(raw: string): string {
  const normalized = normalizeClass(raw);
  return COCO_TO_INVENTORY[normalized] ?? titleCase(normalized);
}
