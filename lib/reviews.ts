import { createClient } from "@/lib/supabase/server";

export async function getFeaturedReviews(limit = 6) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_verified", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }

  return data;
}

export async function getReviewStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("is_verified", true);

  if (error || !data || !data.length) {
    return { averageRating: 5.0, totalReviews: 0 };
  }

  const ratings = data as { rating: number }[];
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / data.length) * 10) / 10,
    totalReviews: data.length,
  };
}
