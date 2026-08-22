import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10, "Review must be at least 10 characters"),
  customerName: z.string().min(1, "Name is required"),
  moveFromCity: z.string().optional(),
  moveToCity: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Rate limit: 5 submissions per 10 min per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`reviews:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }
    const parsed = reviewSchema.safeParse(body);

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
    const { data: { user } } = await supabase.auth.getUser();

    const { data: review, error } = await db
      .from("reviews")
      .insert({
        rating: data.rating,
        title: data.title || null,
        body: data.body,
        customer_name: data.customerName,
        move_from_city: data.moveFromCity || null,
        move_to_city: data.moveToCity || null,
        is_verified: false,
        ...(user ? { customer_id: user.id } : {}),
      })
      .select()
      .single();

    if (error || !review) {
      console.error("Failed to create review:", error);
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verified = searchParams.get("verified") !== "false";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    let query = db
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (verified) {
      query = query.eq("is_verified", true);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error("Failed to fetch reviews:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] }, { status: 200 });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
