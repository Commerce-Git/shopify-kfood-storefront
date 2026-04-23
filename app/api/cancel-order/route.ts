import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";
import { cancelOrder } from "@/lib/shopify/admin";

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
      .select("id, status")
      .eq("shopify_order_id", shopify_order_id)
      .eq("customer_id", user.id)
      .in("status", ["pending", "approved"])
      .single();

    if (existing) {
      const msg =
        existing.status === "approved"
          ? "This order has already been cancelled. Your refund is being processed."
          : "Cancellation is already in progress. Please wait.";
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    // 1. Record cancel request in Supabase (pending)
    const { data: cancelRecord, error: dbError } = await supabase
      .from("storefront_cancel_requests")
      .insert({
        customer_id: user.id,
        customer_email: user.email!,
        shopify_order_id,
        order_number,
        reason: reason || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[cancel-order] DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to submit cancellation request" },
        { status: 500 }
      );
    }

    // 2. Cancel + full refund in Shopify Admin API
    const result = await cancelOrder(shopify_order_id, "customer");

    if (result.success) {
      // Update status to approved
      await supabase
        .from("storefront_cancel_requests")
        .update({ status: "approved" })
        .eq("id", cancelRecord.id);

      return NextResponse.json({
        success: true,
        message: `Order ${order_number} has been cancelled. Your refund of $${result.refundAmount || "0"} is being processed.`,
        refundAmount: result.refundAmount,
      });
    } else {
      // Shopify cancel failed
      console.error("[cancel-order] Shopify cancel failed:", result.error);

      // Update with failure reason so admin can review
      await supabase
        .from("storefront_cancel_requests")
        .update({
          status: "failed",
          reason: `${reason || ""} [AUTO-CANCEL FAILED: ${result.error}]`.trim(),
        })
        .eq("id", cancelRecord.id);

      return NextResponse.json(
        {
          error: `Cancellation failed: ${result.error}`,
          debug: { shopify_order_id, result },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[cancel-order] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
