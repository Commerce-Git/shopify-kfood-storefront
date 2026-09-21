import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testAnonSchema() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from("customer_wishlist").select("*").limit(1);

  if (error) {
    console.log("Anon Client Error:", error.message, error.code, error.details);
  } else {
    console.log("✅ Anon Client successfully accessed 'customer_wishlist'!", data);
  }
}

testAnonSchema();
