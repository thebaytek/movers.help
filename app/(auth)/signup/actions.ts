"use server";

import { createClient } from "@/lib/supabase/server";
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

  if (inviteCode) {
    const { data: invite } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", inviteCode)
      .is("used_by", null)
      .single();

    if (!invite) {
      return { error: "Invalid or expired invite code" };
    }
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        company_name: companyName,
        phone,
        role: "mover",
      })
      .eq("id", data.user.id);

    if (inviteCode) {
      await supabase
        .from("invite_codes")
        .update({ used_by: data.user.id, used_at: new Date().toISOString() })
        .eq("code", inviteCode);
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
