import { verifyOrderLookupEmail } from "@/lib/security/orderOwnership";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrdersByEmail, checkIsSubscribed } from "@/lib/shopify/admin";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { getOrderProgress } from "@/lib/orders/enrichment";
import { aggregateWmsStatus } from "@/lib/orders/status";
import { splitOrderIntoVendorPackages } from "@/lib/shopify/order-utils";


// Helper to aggregate multiple item statuses into a single order status (fallback logic)



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

    const { data: { user } } = await supabase.auth.getUser();
    const ownership = verifyOrderLookupEmail(user, user?.email);
    if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: ownership.status });

    const orders = await getOrdersByEmail(ownership.email);

    // Collect all variant IDs to pre-fetch their images dynamically
    const variantIds = Array.from(
      new Set(
        orders
          .flatMap((order) => order.lineItems.edges.map((edge) => edge.node.variantId))
          .filter(Boolean) as string[]
      )
    );

    const variantImageMap: Record<string, { url: string; altText: string | null } | null> = {};

    for (let offset = 0; offset < variantIds.length; offset += 250) {
      try {
        const response = await storefrontFetch<{ nodes: Array<{ id: string; image: { url: string; altText?: string | null } | null } | null> }>(GET_VARIANT_IMAGES, { ids: variantIds.slice(offset, offset + 250) });
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

    const { viewStatusMap, artistOrdersMap, artistStatusByOrderAndVendor } = await getOrderProgress(orders);

    // Map variant images, WMS status, and split packages back to orders
    const ordersWithImages = orders.map((order) => {
      const viewResult = viewStatusMap[order.id];
      const wmsStatus = viewResult?.customer_status || aggregateWmsStatus(order.fulfillmentStatus, artistOrdersMap[order.id]);
      const deliveredAt = viewResult?.delivered_at || null;

      const updatedLineItemsEdges = order.lineItems.edges.map((edge) => {
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
      });

      // Split into clean atelier-unit packages
      const packages = splitOrderIntoVendorPackages({
        orderId: order.id,
        lineItems: updatedLineItemsEdges,
        artistStatusMap: artistStatusByOrderAndVendor[order.id] || {},
        orderFulfillmentStatus: order.fulfillmentStatus,
        orderWmsStatus: wmsStatus,
        orderTracking: order.tracking,
        fulfillments: order.fulfillments,
        deliveredAt,
      });

      return {
        ...order,
        wmsStatus,
        deliveredAt,
        lineItems: {
          ...order.lineItems,
          edges: updatedLineItemsEdges,
        },
        packages,
      };
    });

    const isSubscribed = await checkIsSubscribed(ownership.email);

    return NextResponse.json({ isSubscribed, orders: ordersWithImages }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[/api/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

