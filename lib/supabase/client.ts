import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as unknown as SupabaseClient<Database>; // ssr's return type is mis-slotted against supabase-js 2.110
}
