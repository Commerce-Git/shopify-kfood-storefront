import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { shopify_order_id, order_number, reason } = body;

    if (!shopify_order_id || !order_number) {
      return NextResponse.json(
        { error: "Missing order information" },
        { status: 400 }
      );
    }

    // Check for duplicate request
    const { data: existing } = await supabase
      .from("storefront_cancel_requests")
      .select("id")
      .eq("shopify_order_id", shopify_order_id)
      .eq("customer_id", user.id)
      .in("status", ["pending", "approved"])
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Cancellation already requested for this order" },
        { status: 409 }
      );
    }

    // Insert cancel request
    const { error } = await supabase
      .from("storefront_cancel_requests")
      .insert({
        customer_id: user.id,
        customer_email: user.email!,
        shopify_order_id,
        order_number,
        reason: reason || null,
        status: "pending",
      });

    if (error) {
      console.error("[cancel-order] DB error:", error);
      return NextResponse.json(
        { error: "Failed to submit cancellation request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cancellation request for order ${order_number} has been submitted.`,
      cancel_window_hours: CANCEL_WINDOW_HOURS,
    });
  } catch (error) {
    console.error("[cancel-order] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
