import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2025-10/graphql.json`;

const query = `
  query GetVariantStock($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        id
        quantityAvailable
        currentlyNotInStock
      }
    }
  }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId");

  if (!variantId) {
    return NextResponse.json({ success: false, error: "variantId is required" }, { status: 400 });
  }

  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
      throw new Error("Shopify credentials not configured in environment.");
    }

    const res = await fetch(STOREFRONT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { id: variantId } }),
      cache: "no-store", // Bypass Next.js fetch cache
    });

    if (!res.ok) {
      throw new Error(`Shopify Storefront API error: ${res.statusText}`);
    }

    const json = await res.json();
    
    if (json.errors) {
      const messages = json.errors.map((e: any) => e.message).join(", ");
      throw new Error(`GraphQL Errors: ${messages}`);
    }

    const variantNode = json.data?.node;

    if (!variantNode) {
      return NextResponse.json({ success: false, error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      quantityAvailable: variantNode.quantityAvailable, // number | null
      currentlyNotInStock: variantNode.currentlyNotInStock, // boolean
    });
  } catch (error: any) {
    console.error("[Stock API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
