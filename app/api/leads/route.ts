import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendLeadNotification } from "@/lib/email";

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
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

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
