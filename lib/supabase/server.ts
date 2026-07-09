import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

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

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: createCookieMethods(cookieStore),
    }
  );
}

export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: createCookieMethods(cookieStore),
    }
  );
}
