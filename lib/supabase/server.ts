import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// @supabase/ssr 0.5.x declares createServerClient's return type with the old 3-arg
// SupabaseClient<Database, SchemaName, Schema> layout; the installed supabase-js 2.110 adds a
// SchemaNameOrClientOptions slot in position 2, so the Schema object ssr passes lands in the
// SchemaName slot and the real Schema slot collapses to `never`. Re-type through the
// single-generic form so supabase-js recomputes Schema = Database["public"].

type CookieSetter = {
  name: string;
  value: string;
  options: CookieOptions;
};

function createCookieMethods(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    getAll(): { name: string; value: string }[] {
      return cookieStore.getAll() as { name: string; value: string }[];
    },
    setAll(cookiesToSet: CookieSetter[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Ignore cookie errors in non-request contexts
      }
    },
  };
}

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: createCookieMethods(cookieStore),
    }
  ) as unknown as SupabaseClient<Database>; // ssr's return type is mis-slotted against supabase-js 2.110
}

export async function createAdminClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: createCookieMethods(cookieStore),
    }
  ) as unknown as SupabaseClient<Database>; // ssr's return type is mis-slotted against supabase-js 2.110
}
