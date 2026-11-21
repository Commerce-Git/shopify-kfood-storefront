import { NextResponse } from 'next/server';
import { requestMarket } from '@/lib/markets/request';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { storefrontFetch } from '@/lib/shopify/storefront';

const query = `query BagPrices($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
  nodes(ids: $ids) { ... on ProductVariant { id availableForSale product { id } price { amount currencyCode } } }
}`;
type Variant = { id: string; availableForSale: boolean; product: { id: string }; price: { amount: string; currencyCode: string } };

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  const ids: unknown = input?.ids;
  if (!Array.isArray(ids) || !ids.length || ids.length > 250 || !ids.every(id => typeof id === 'string' && /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(id))) {
    return NextResponse.json({ error: 'Invalid bag items.' }, { status: 400 });
  }
  try {
    const { country } = await requestMarket();
    if (country !== input.country) return NextResponse.json({ error: 'Shipping destination changed. Reload your bag.' }, { status: 409 });
    const { nodes } = await storefrontFetch<{ nodes: (Variant | null)[] }>(query, { ids, country }, { cache: 'no-store', signal: request.signal });
    const products = [...new Set(nodes.flatMap(v => v?.product ? [v.product.id] : []))];
    const confirmed = new Map<string, number>();
    // A contextual price can fall back to the base price. Match the last observed FIXED amounts.
    for (let i = 0; i < products.length; i += 40) {
      const { data, error } = await supabaseAdmin.from('product_market_prices')
        .select('shopify_sync,master_products!inner(shopify_product_id,status)').eq('country', country)
        .eq('master_products.status', 'registered').in('master_products.shopify_product_id', products.slice(i, i + 40));
      if (error) throw error;
      for (const row of data) {
        for (const v of row.shopify_sync?.variants ?? []) {
          if (v.amount != null) confirmed.set(v.variantId, Number(v.amount));
        }
      }
    }
    const prices = ids.map((id, index) => {
      const v = nodes[index];
      const amount = v?.price?.amount;
      if (v?.id !== id || !v?.availableForSale) return { id, issue: 'Unavailable for this destination.' };
      if (!amount || v.price.currencyCode !== 'USD' || confirmed.get(id) !== Number(amount)) return { id, issue: 'Price is being confirmed for this destination.' };
      return { id, amount };
    });
    return NextResponse.json({ country, prices }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Couldn’t confirm bag prices. Please try again.' }, { status: 503 });
  }
}
