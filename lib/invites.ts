import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InviteRow = { code: string; expires_at: string | null; used_by: string | null; [key: string]: any };

export async function validateInviteCode(code: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("code", code)
    .is("used_by", null)
    .single();

  if (error || !data) {
    return { valid: false, message: "Invalid or expired invite code" };
  }

  const invite = data as InviteRow;

  // Check expiry
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { valid: false, message: "This invite code has expired" };
  }

  return { valid: true, invite };
}

export async function consumeInviteCode(code: string, userId: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("invite_codes")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("code", code)
    .is("used_by", null);

  return !error;
}
