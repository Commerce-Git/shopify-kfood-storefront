import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrdersByEmail } from "@/lib/shopify/admin";

/**
 * GET /api/orders
 * Fetches the authenticated user's orders from Shopify Admin API by email.
 * Server-side only — the Admin token is never exposed to the client.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch orders from Shopify Admin API by email
    const orders = await getOrdersByEmail(user.email);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[/api/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
