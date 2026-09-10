import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function verify() {
  const { supabaseAdmin } = await import("../lib/supabase/admin");
  console.log("=== 1. Testing Supabase Reviews Query (with new composite index) ===");
  const start = performance.now();
  const { data: reviews, error: reviewError } = await supabaseAdmin
    .from("reviews")
    .select("id, customer_name, rating, title, body, photo_urls, submitted_at")
    .not("rating", "is", null)
    .eq("status", "approved")
    .order("submitted_at", { ascending: false })
    .limit(10);
  const duration = (performance.now() - start).toFixed(2);

  if (reviewError) {
    console.error("❌ Reviews query failed:", reviewError);
  } else {
    console.log(`✅ Reviews query succeeded in ${duration}ms! Found ${reviews?.length || 0} reviews.`);
    if (reviews && reviews.length > 0) {
      console.log("   Sample review:", {
        id: reviews[0].id,
        name: reviews[0].customer_name,
        rating: reviews[0].rating,
        date: reviews[0].submitted_at,
      });
    }
  }

  console.log("\n=== 2. Testing Product Views Table & Query ===");
  const { data: viewsData, error: viewsError } = await supabaseAdmin
    .from("product_views")
    .select("product_handle, view_count, last_viewed_at")
    .limit(5);

  if (viewsError) {
    console.error("❌ Product views query failed:", viewsError);
  } else {
    console.log(`✅ Product views query succeeded! Found ${viewsData?.length || 0} rows.`);
    if (viewsData && viewsData.length > 0) {
      console.log("   Sample views row:", viewsData[0]);
    }
  }

  console.log("\n=== 3. Optimization Verification Completed ===");
}

verify().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
