import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { CopyInviteButton } from "./copy-invite-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: codes } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Settings</h1>
        <p className="text-surface-500 dark:text-surface-400">
          Invite codes for onboarding movers.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {!codes || codes.length === 0 ? (
            <p className="text-surface-500 dark:text-surface-400">
              No invite links yet — you&apos;ll get one once you&apos;re set up.
            </p>
          ) : (
            codes.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-surface-900 dark:text-surface-100 truncate">
                    {c.code}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {c.used_by ? "Used" : "Available"}
                    {c.expires_at ? ` · expires ${new Date(c.expires_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <CopyInviteButton code={c.code} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
