/**
 * Furniture catalog — fetches canonical cubic footage from Supabase.
 * Cached in-memory after first fetch. Falls back to local getCuFt().
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface CatalogRow {
  id: string;
  label: string;
  cu_ft: number;
  category: string | null;
}

let catalogCache: Map<string, number> | null = null;
let fetchPromise: Promise<Map<string, number>> | null = null;

/**
 * Fetch the furniture catalog from Supabase.
 * Results are cached in memory — only fetched once per session.
 */
export async function fetchFurnitureCatalog(): Promise<Map<string, number>> {
  // Return cached result
  if (catalogCache) return catalogCache;

  // Deduplicate concurrent calls
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const url = `${SUPABASE_URL}/rest/v1/furniture_catalog?select=label,cu_ft`;
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Catalog fetch failed: ${res.status}`);
      }

      const rows: CatalogRow[] = await res.json();
      catalogCache = new Map(rows.map((r) => [r.label, r.cu_ft]));
      return catalogCache;
    } catch (err) {
      console.warn("Failed to fetch furniture catalog, using local fallback:", err);
      catalogCache = new Map(); // empty map → will use local getCuFt()
      return catalogCache;
    }
  })();

  return fetchPromise;
}

/**
 * Look up cubic footage for a furniture label.
 * Checks Supabase catalog first, returns null if not found.
 */
export async function lookupCuFt(label: string): Promise<number | null> {
  const catalog = await fetchFurnitureCatalog();
  return catalog.get(label) ?? null;
}

/**
 * Synchronous lookup using cached catalog.
 * Returns null if catalog hasn't been fetched yet or item not found.
 */
export function lookupCuFtCached(label: string): number | null {
  return catalogCache?.get(label) ?? null;
}

/**
 * Check if catalog has been fetched and cached.
 */
export function isCatalogReady(): boolean {
  return catalogCache !== null;
}

/**
 * Reset cache (for testing).
 */
export function resetCatalog(): void {
  catalogCache = null;
  fetchPromise = null;
}
