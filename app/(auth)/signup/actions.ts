"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const companyName = formData.get("companyName") as string;
  const phone = formData.get("phone") as string;
  const inviteCode = formData.get("inviteCode") as string;

  // Invite codes sit behind RLS (anonymous reads are blocked), so validate and
  // redeem via the service-role client. This runs server-side only.
  let isMover = false;
  if (inviteCode) {
    const admin = await createAdminClient();
    const { data: invite } = await admin
      .from("invite_codes")
      .select("*")
      .eq("code", inviteCode)
      .is("used_by", null)
      .single();

    if (!invite || (invite.expires_at && new Date(invite.expires_at) < new Date())) {
      return { error: "Invalid or expired invite code" };
    }
    isMover = true;
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const admin = await createAdminClient();

    // Redeem atomically BEFORE granting the mover role (race-safe).
    if (isMover && inviteCode) {
      const { data: redeemed, error: redeemError } = await admin
        .from("invite_codes")
        .update({ used_by: data.user.id, used_at: new Date().toISOString() })
        .eq("code", inviteCode)
        .is("used_by", null)
        .select()
        .single();

      if (redeemError || !redeemed) {
        // Lost a race on the code — the account stays a customer.
        await admin
          .from("profiles")
          .update({ full_name: fullName, company_name: companyName, phone })
          .eq("id", data.user.id);
        return { error: "Invite code already in use" };
      }
    }

    await admin
      .from("profiles")
      .update({
        full_name: fullName,
        company_name: companyName,
        phone,
        ...(isMover ? { role: "mover" } : {}),
      })
      .eq("id", data.user.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
