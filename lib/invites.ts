import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

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

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, message: "This invite code has expired" };
  }

  return { valid: true, invite: data };
}

export async function consumeInviteCode(code: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invite_codes")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("code", code)
    .is("used_by", null);

  return !error;
}
