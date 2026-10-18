import { supabaseAdmin } from '@/lib/supabase/admin';
import type { MappedOrder } from '@/lib/shopify/admin';
import { getArtistSlug } from '@/lib/artists';
import { aggregateArtistStatus } from './status';

async function readRows(table: 'order_status_view' | 'artist_orders', fields: string, column: string, ids: string[]) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabaseAdmin.from(table).select(fields).in(column, ids)
      .order(table === 'artist_orders' ? 'id' : 'shopify_id').range(offset, offset + 499)
      .returns<Array<{ shopify_id: string; customer_status: 'placed' | 'crafting' | 'packaging' | 'shipped' | 'delivered'; delivered_at: string | null; shopify_order_id: string; artist_name: string | null; status: string | null }>>();
    if (error) return { data: null, error };
    if (data) rows.push(...data);
    if (!data || data.length < 500) return { data: rows, error: null };
  }
}

export async function getOrderProgress(orders: MappedOrder[]) {
    const shopifyIds = orders.map((o) => o.id);
    const viewStatusMap: Record<string, { customer_status: "placed" | "crafting" | "packaging" | "shipped" | "delivered"; delivered_at: string | null }> = {};
    const artistOrdersMap: Record<string, string[]> = {};
    const artistStatusByOrderAndVendor: Record<string, Record<string, string>> = {};

    for (let offset = 0; offset < shopifyIds.length; offset += 100) {
      const batch = shopifyIds.slice(offset, offset + 100);
      // 1. Try querying unified order_status_view first
      const { data: viewData, error: viewError } = await readRows('order_status_view', 'shopify_id, customer_status, delivered_at', 'shopify_id', batch);

      if (!viewError && viewData && viewData.length > 0) {
        for (const row of viewData) {
          if (row.shopify_id && row.customer_status) {
            viewStatusMap[row.shopify_id] = {
              customer_status: row.customer_status,
              delivered_at: row.delivered_at || null,
            };
          }
        }
      }

      // 2. Query artist_orders for artist-specific crafting status
      const { data: artistOrders, error: dbError } = await readRows('artist_orders', 'shopify_order_id, artist_name, status', 'shopify_order_id', batch);

      if (!dbError && artistOrders) {
        for (const row of artistOrders) {
          const sId = row.shopify_order_id;
          const aName = (row.artist_name || "").toLowerCase().trim();
          const aSlug = getArtistSlug(row.artist_name || "");
          const aStatus = (row.status || "").toLowerCase().trim();
          if (aStatus === "cancelled") continue;

          if (!artistOrdersMap[sId]) artistOrdersMap[sId] = [];
          artistOrdersMap[sId].push(aStatus);

          if (!artistStatusByOrderAndVendor[sId]) artistStatusByOrderAndVendor[sId] = {};
          artistStatusByOrderAndVendor[sId][aName] = aggregateArtistStatus([artistStatusByOrderAndVendor[sId][aName] || aStatus, aStatus]);
          if (aSlug) {
            artistStatusByOrderAndVendor[sId][aSlug] = aggregateArtistStatus([artistStatusByOrderAndVendor[sId][aSlug] || aStatus, aStatus]);
          }
        }
      }
    }

    return { viewStatusMap, artistOrdersMap, artistStatusByOrderAndVendor };
}
