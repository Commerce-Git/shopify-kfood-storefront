import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create or update storefront_customers record
      const { data: existing } = await supabase
        .from("storefront_customers")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        await supabase.from("storefront_customers").insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: data.user.user_metadata?.full_name?.split(" ")[0] || null,
          last_name: data.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          marketing_consent: false,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/account/login?error=auth_failed`);
}
