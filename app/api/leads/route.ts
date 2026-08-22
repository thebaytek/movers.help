import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendLeadNotification } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { Database } from "@/types/supabase";

const leadSchema = z.object({
  moveFromCity: z.string().min(1),
  moveFromState: z.string().min(2).max(2),
  moveToCity: z.string().min(1),
  moveToState: z.string().min(2).max(2),
  moveDate: z.string().optional(),
  totalCuFt: z.number().default(0),
  totalItems: z.number().default(0),
  agreedQuote: z.number().optional(),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  inventory: z.array(z.object({
    room: z.string(),
    item: z.string(),
    quantity: z.number().default(1),
    cuFtPerItem: z.number().default(15),
  })).default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot: hidden field — bots fill it, humans don't
    if (body.website) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Rate limit: 5 submissions per 10 min per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`leads:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = await createClient();
    const db = supabase;

    // Create the lead
    const { data: lead, error: leadError } = await db
      .from("leads")
      .insert({
        move_from_city: data.moveFromCity,
        move_from_state: data.moveFromState,
        move_to_city: data.moveToCity,
        move_to_state: data.moveToState,
        move_date: data.moveDate,
        total_cu_ft: data.totalCuFt,
        total_items: data.totalItems,
        agreed_quote: data.agreedQuote,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        status: "new",
      })
      .select()
      .single();

    if (leadError || !lead) {
      console.error("Failed to create lead:", leadError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // Create inventory items
    if (data.inventory.length > 0) {
      const { error: invError } = await db
        .from("inventory_items")
        .insert(
          data.inventory.map((item) => ({
            lead_id: lead.id,
            room: item.room,
            item: item.item,
            quantity: item.quantity,
            cu_ft_per_item: item.cuFtPerItem,
          }))
        );

      if (invError) {
        console.error("Failed to create inventory:", invError);
      }
    }

    // Send email notification (non-blocking)
    sendLeadNotification({
      customerName: data.contactName,
      customerEmail: data.contactEmail,
      moveFromCity: data.moveFromCity,
      moveFromState: data.moveFromState,
      moveToCity: data.moveToCity,
      moveToState: data.moveToState,
      agreedQuote: data.agreedQuote,
    }).catch(console.error);

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const patchSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["new", "contacted", "quoted", "booked", "completed", "closed"]).optional(),
  moverId: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { leadId, ...updates } = parsed.data;

    // Authz: session required
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role;

    if (role !== "mover" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Map camelCase to snake_case for DB
    const dbUpdates: Database["public"]["Tables"]["leads"]["Update"] = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    // Only admins may reassign a lead
    if (role === "admin" && updates.moverId !== undefined) dbUpdates.mover_id = updates.moverId;

    // Admin: service-role bypasses RLS. Mover: anon client, RLS restricts to assigned leads.
    const db = role === "admin" ? await createAdminClient() : supabase;

    const { data: lead, error } = await db
      .from("leads")
      .update(dbUpdates)
      .eq("id", leadId)
      .select()
      .single();

    if (error || !lead) {
      // A mover touching a non-assigned lead is blocked by RLS → 403, not 500
      return NextResponse.json(
        { error: role === "mover" ? "Forbidden" : "Failed to update lead" },
        { status: role === "mover" ? 403 : 500 }
      );
    }

    return NextResponse.json({ success: true, lead }, { status: 200 });
  } catch (error) {
    console.error("Lead PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
