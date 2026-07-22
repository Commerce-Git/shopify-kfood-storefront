import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrdersByEmail, getAdminToken, checkIsSubscribed } from "@/lib/shopify/admin";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Helper to aggregate multiple item statuses into a single order status
function aggregateWmsStatus(shopifyStatus: string, artistStatuses: string[] | undefined): "placed" | "crafting" | "packaging" | "shipped" {
  if (shopifyStatus === "FULFILLED") return "shipped";
  if (!artistStatuses || artistStatuses.length === 0) return "placed";

  if (artistStatuses.includes("pending")) return "placed";
  if (artistStatuses.includes("confirmed")) return "crafting";
  if (artistStatuses.includes("shipped") || artistStatuses.includes("received")) return "packaging";

  return "placed";
}


const GET_VARIANT_IMAGES = `
  query getVariantImages($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        image {
          url
          altText
        }
      }
    }
  }
`;

/**
 * GET /api/orders
 * Fetches the authenticated user's orders from Shopify Admin API by email.
 * Server-side only — the Admin token is never exposed to the client.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Parallel: auth check + token warm-up
    const [{ data: { user } }, _token] = await Promise.all([
      supabase.auth.getUser(),
      getAdminToken(), // Pre-warm token while auth check runs
    ]);

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Token is already cached from Promise.all above, so this is instant
    const orders = await getOrdersByEmail(user.email);

    // Collect all variant IDs to pre-fetch their images dynamically
    const variantIds = Array.from(
      new Set(
        orders
          .flatMap((order) => order.lineItems.edges.map((edge) => edge.node.variantId))
          .filter(Boolean) as string[]
      )
    );

    const variantImageMap: Record<string, { url: string; altText: string | null } | null> = {};

    if (variantIds.length > 0) {
      try {
        const response = await storefrontFetch<{ nodes: any[] }>(GET_VARIANT_IMAGES, { ids: variantIds });
        if (response?.nodes) {
          response.nodes.forEach((node) => {
            if (node && node.id) {
              variantImageMap[node.id] = node.image
                ? { url: node.image.url, altText: node.image.altText || null }
                : null;
            }
          });
        }
      } catch (err) {
        console.error("[/api/orders] Failed to fetch variant images:", err);
      }
    }

    const shopifyIds = orders.map((o) => o.id);
    let artistOrdersMap: Record<string, string[]> = {};

    if (shopifyIds.length > 0) {
      const { data: artistOrders, error: dbError } = await supabaseAdmin
        .from("artist_orders")
        .select("shopify_order_id, status")
        .in("shopify_order_id", shopifyIds);

      if (!dbError && artistOrders) {
        for (const row of artistOrders) {
          if (!artistOrdersMap[row.shopify_order_id]) {
            artistOrdersMap[row.shopify_order_id] = [];
          }
          artistOrdersMap[row.shopify_order_id].push(row.status.toLowerCase());
        }
      }
    }

    // Map variant images and WMS status back to order line items
    const ordersWithImages = orders.map((order) => ({
      ...order,
      wmsStatus: aggregateWmsStatus(order.fulfillmentStatus, artistOrdersMap[order.id]),
      lineItems: {
        ...order.lineItems,
        edges: order.lineItems.edges.map((edge) => {
          const varId = edge.node.variantId;
          const image = varId ? variantImageMap[varId] || null : null;
          return {
            ...edge,
            node: {
              ...edge.node,
              variant: edge.node.variant
                ? {
                    ...edge.node.variant,
                    image,
                  }
                : null,
            },
          };
        }),
      },
    }));

    const isSubscribed = await checkIsSubscribed(user.email);

    return NextResponse.json({ isSubscribed, orders: ordersWithImages });
  } catch (error) {
    console.error("[/api/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
