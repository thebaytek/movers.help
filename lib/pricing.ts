import type { MoveDetails, InventoryItem, QuoteResult, QuoteBreakdownItem } from "@/types";

// Approximate driving distances between major US cities (in miles)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "New York,NY": { lat: 40.7128, lng: -74.006 },
  "Los Angeles,CA": { lat: 34.0522, lng: -118.2437 },
  "Chicago,IL": { lat: 41.8781, lng: -87.6298 },
  "Houston,TX": { lat: 29.7604, lng: -95.3698 },
  "Phoenix,AZ": { lat: 33.4484, lng: -112.074 },
  "Philadelphia,PA": { lat: 39.9526, lng: -75.1652 },
  "San Antonio,TX": { lat: 29.4241, lng: -98.4936 },
  "San Diego,CA": { lat: 32.7157, lng: -117.1611 },
  "Dallas,TX": { lat: 32.7767, lng: -96.797 },
  "Austin,TX": { lat: 30.2672, lng: -97.7431 },
  "San Jose,CA": { lat: 37.3382, lng: -121.8863 },
  "Jacksonville,FL": { lat: 30.3322, lng: -81.6557 },
  "Fort Worth,TX": { lat: 32.7555, lng: -97.3308 },
  "Columbus,OH": { lat: 39.9612, lng: -82.9988 },
  "Charlotte,NC": { lat: 35.2271, lng: -80.8431 },
  "Indianapolis,IN": { lat: 39.7684, lng: -86.1581 },
  "San Francisco,CA": { lat: 37.7749, lng: -122.4194 },
  "Seattle,WA": { lat: 47.6062, lng: -122.3321 },
  "Denver,CO": { lat: 39.7392, lng: -104.9903 },
  "Washington,DC": { lat: 38.9072, lng: -77.0369 },
  "Nashville,TN": { lat: 36.1627, lng: -86.7816 },
  "Oklahoma City,OK": { lat: 35.4676, lng: -97.5164 },
  "El Paso,TX": { lat: 31.7619, lng: -106.485 },
  "Boston,MA": { lat: 42.3601, lng: -71.0589 },
  "Portland,OR": { lat: 45.5152, lng: -122.6784 },
  "Las Vegas,NV": { lat: 36.1699, lng: -115.1398 },
  "Memphis,TN": { lat: 35.1495, lng: -90.049 },
  "Louisville,KY": { lat: 38.2527, lng: -85.7585 },
  "Baltimore,MD": { lat: 39.2904, lng: -76.6122 },
  "Milwaukee,WI": { lat: 43.0389, lng: -87.9065 },
  "Albuquerque,NM": { lat: 35.0853, lng: -106.6056 },
  "Tucson,AZ": { lat: 32.2226, lng: -110.9747 },
  "Fresno,CA": { lat: 36.7372, lng: -119.7871 },
  "Sacramento,CA": { lat: 38.5816, lng: -121.4944 },
  "Mesa,AZ": { lat: 33.4152, lng: -111.8315 },
  "Kansas City,MO": { lat: 39.0997, lng: -94.5786 },
  "Atlanta,GA": { lat: 33.749, lng: -84.388 },
  "Omaha,NE": { lat: 41.2565, lng: -95.9345 },
  "Colorado Springs,CO": { lat: 38.8339, lng: -104.8214 },
  "Raleigh,NC": { lat: 35.7796, lng: -78.6382 },
  "Miami,FL": { lat: 25.7617, lng: -80.1918 },
  "Virginia Beach,VA": { lat: 36.8529, lng: -75.978 },
  "Tampa,FL": { lat: 27.9506, lng: -82.4572 },
  "Minneapolis,MN": { lat: 44.9778, lng: -93.265 },
  "New Orleans,LA": { lat: 29.9511, lng: -90.0715 },
  "Cleveland,OH": { lat: 41.4993, lng: -81.6944 },
  "Honolulu,HI": { lat: 21.3069, lng: -157.8583 },
  "Detroit,MI": { lat: 42.3314, lng: -83.0458 },
  "Pittsburgh,PA": { lat: 40.4406, lng: -79.9959 },
  "St. Louis,MO": { lat: 38.627, lng: -90.1994 },
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function estimateDistance(fromCity: string, fromState: string, toCity: string, toState: string): number {
  const fromKey = `${fromCity},${fromState}`;
  const toKey = `${toCity},${toState}`;

  const fromCoords = CITY_COORDS[fromKey];
  const toCoords = CITY_COORDS[toKey];

  if (fromCoords && toCoords) {
    return haversineDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
  }

  // Fallback: state-to-state rough average
  if (fromState === toState) return 150; // in-state move
  return 1200; // cross-country fallback
}

function getSeasonalMultiplier(dateStr: string): number {
  const month = new Date(dateStr).getMonth(); // 0-11
  // May-Sep (4-8): summer peak = 1.25
  // Nov-Feb (10-1): winter off-peak = 0.85
  // Mar-Apr, Oct: shoulder = 1.0
  if (month >= 4 && month <= 8) return 1.25;
  if (month >= 10 || month <= 1) return 0.85;
  return 1.0;
}

export function calculateQuote(
  moveDetails: MoveDetails,
  inventory: InventoryItem[],
  options?: {
    needsPacking?: boolean;
    needsStorage?: boolean;
    storageDays?: number;
    hasStairs?: boolean;
    hasElevator?: boolean;
  }
): QuoteResult {
  const distance = estimateDistance(
    moveDetails.fromCity, moveDetails.fromState,
    moveDetails.toCity, moveDetails.toState
  );

  const totalCuFt = inventory.reduce(
    (sum, item) => sum + item.cuFtPerItem * item.quantity, 0
  );

  const seasonalMultiplier = getSeasonalMultiplier(moveDetails.moveDate);

  // Pricing model
  const BASE_RATE_PER_CUFT = 5.5;
  const RATE_PER_MILE = 0.65;
  const LABOR_RATE_PER_HOUR = 65;
  const LABOR_HOURS_PER_100_CUFT = 1.5;
  const PACKING_RATE_PER_CUFT = 1.25;
  const STORAGE_RATE_PER_DAY = 25;

  const volumeCost = totalCuFt * BASE_RATE_PER_CUFT;
  const distanceCost = distance * RATE_PER_MILE;
  const laborHours = Math.ceil((totalCuFt / 100) * LABOR_HOURS_PER_100_CUFT);
  const laborCost = laborHours * LABOR_RATE_PER_HOUR * (options?.hasStairs ? 1.3 : 1);

  const accessibilityFee = options?.hasStairs ? 200 : options?.hasElevator ? 0 : 100;
  const packingFee = options?.needsPacking ? totalCuFt * PACKING_RATE_PER_CUFT : 0;
  const storageFee = options?.needsStorage
    ? (options?.storageDays || 7) * STORAGE_RATE_PER_DAY
    : 0;

  const subtotal =
    (volumeCost + distanceCost + laborCost + accessibilityFee + packingFee + storageFee) *
    seasonalMultiplier;

  const estimatedTotal = Math.max(subtotal, 500); // $500 minimum

  const breakdown: QuoteBreakdownItem[] = [
    {
      label: "Volume Cost",
      amount: volumeCost,
      description: `${Math.round(totalCuFt)} cu ft at $${BASE_RATE_PER_CUFT}/cu ft`,
    },
    {
      label: "Distance Cost",
      amount: distanceCost,
      description: `${distance.toLocaleString()} miles at $${RATE_PER_MILE}/mile`,
    },
    {
      label: "Labor",
      amount: laborCost,
      description: `~${laborHours} hours at $${LABOR_RATE_PER_HOUR}/hr`,
    },
    {
      label: "Seasonal Adjustment",
      amount: (volumeCost + distanceCost + laborCost) * (seasonalMultiplier - 1),
      description: `${seasonalMultiplier === 1.25 ? "Summer peak" : seasonalMultiplier === 0.85 ? "Winter discount" : "Standard"} rate`,
    },
  ];

  if (accessibilityFee > 0) {
    breakdown.push({
      label: "Accessibility",
      amount: accessibilityFee,
      description: options?.hasStairs ? "Stairs surcharge" : "Standard access fee",
    });
  }

  if (packingFee > 0) {
    breakdown.push({
      label: "Packing Service",
      amount: packingFee,
      description: `Full pack at $${PACKING_RATE_PER_CUFT}/cu ft`,
    });
  }

  if (storageFee > 0) {
    breakdown.push({
      label: "Storage",
      amount: storageFee,
      description: `${options?.storageDays || 7} days at $${STORAGE_RATE_PER_DAY}/day`,
    });
  }

  return {
    basePrice: estimatedTotal,
    distanceMiles: distance,
    distanceCost,
    volumeCuFt: totalCuFt,
    volumeCost,
    laborCost,
    seasonalMultiplier,
    accessibilityFee,
    packingFee,
    storageFee,
    subtotal,
    estimatedTotal,
    breakdown,
  };
}
