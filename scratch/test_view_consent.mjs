import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function testConsentToggleInView() {
  console.log("=== Testing Consent Toggle Reflection in active_artist_drop_subscribers View ===");

  const { data: customer } = await supabase
    .from("storefront_customers")
    .select("id, email, marketing_consent")
    .eq("email", "thec9rqwer@gmail.com")
    .single();

  if (!customer) {
    console.log("Customer not found.");
    return;
  }

  const originalConsent = customer.marketing_consent;
  const testUserId = customer.id;
  const testSlug = "soyo-studio";

  // 1. Ensure a follow record exists with status = 'active'
  await supabase
    .from("customer_followed_artists")
    .upsert({
      user_id: testUserId,
      artist_slug: testSlug,
      artist_name: "Soyo Studio",
      notify_drops: true,
      status: "active",
      unfollowed_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,artist_slug" });

  // 2. Flip consent to true
  await supabase
    .from("storefront_customers")
    .update({ marketing_consent: true })
    .eq("id", testUserId);

  // 3. Query the view
  const { data: viewWhenTrue } = await supabase
    .from("active_artist_drop_subscribers")
    .select("*")
    .eq("artist_slug", testSlug)
    .eq("user_id", testUserId);

  console.log("When marketing_consent = true, view rows returned:", viewWhenTrue?.length);
  if (viewWhenTrue && viewWhenTrue.length > 0) {
    console.log("Subscriber row:", JSON.stringify(viewWhenTrue[0], null, 2));
  }

  // 4. Flip consent back to original
  await supabase
    .from("storefront_customers")
    .update({ marketing_consent: originalConsent })
    .eq("id", testUserId);

  // 5. Query the view again
  const { data: viewWhenRestored } = await supabase
    .from("active_artist_drop_subscribers")
    .select("*")
    .eq("artist_slug", testSlug)
    .eq("user_id", testUserId);

  console.log("When marketing_consent restored to", originalConsent, ", view rows returned:", viewWhenRestored?.length);

  // Clean up test follow
  await supabase
    .from("customer_followed_artists")
    .delete()
    .eq("user_id", testUserId)
    .eq("artist_slug", testSlug);

  console.log("=== Test Complete ===");
}

testConsentToggleInView().catch(console.error);
