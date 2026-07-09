"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-surface-500 hover:text-red-600"
      onClick={handleSignOut}
    >
      <LogOut className="w-5 h-5 mr-3" />
      Sign Out
    </Button>
  );
}
