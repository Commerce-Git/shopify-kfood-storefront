import { errorMessage } from "@/lib/errors";
import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify/api";
import { getArtistSlug, getArtistBySlug } from "@/lib/artists";
import type { ShopifyImage, ShopifyProduct } from "@/lib/shopify/types";

export const dynamic = "force-dynamic";

export interface WishlistProductItem {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  artistSlug: string;
  artistName: string;
  price: string;
  compareAtPrice?: string | null;
  availableForSale: boolean;
  variantId: string;
  variantTitle: string;
  image: ShopifyImage | null;
}

function formatProduct(p: ShopifyProduct): WishlistProductItem {
  const vendorSlug = getArtistSlug(p.vendor || "");
  const artistProfile = getArtistBySlug(vendorSlug, p.vendor);
  const selectedVariant = p.variants?.edges?.[0]?.node;
  const imageNode = selectedVariant?.image || p.images?.edges?.[0]?.node || null;

  const currencyPrefix = selectedVariant?.price?.currencyCode === "USD" ? "$" : "";
  const priceFormatted = selectedVariant?.price?.amount
    ? `${currencyPrefix}${parseFloat(selectedVariant.price.amount).toFixed(2)}`
    : "$0.00";

  const compareFormatted = selectedVariant?.compareAtPrice?.amount
    ? `${currencyPrefix}${parseFloat(selectedVariant.compareAtPrice.amount).toFixed(2)}`
    : null;

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor || "Blank Seoul",
    artistSlug: artistProfile.slug,
    artistName: artistProfile.name,
    price: priceFormatted,
    compareAtPrice: compareFormatted,
    availableForSale: selectedVariant?.availableForSale ?? true,
    variantId: selectedVariant?.id || "",
    variantTitle: selectedVariant?.title || "Default Title",
    image: imageNode
      ? {
          url: imageNode.url,
          altText: imageNode.altText ?? null,
          width: imageNode.width || 800,
          height: imageNode.height || 800,
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawItems = searchParams.get("items") || searchParams.get("handles") || "";
    const cleanItems = rawItems
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const rawSlugs = searchParams.get("artistSlugs") || "";
    const cleanSlugs = rawSlugs
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (cleanItems.length === 0 && cleanSlugs.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
        studioWorks: {},
      });
    }

    // 1. Fetch live products from Shopify (benefiting from Next.js Data Cache revalidate: 60)
    const allProducts = await getAllProducts(50);

    // 2. Dual-matching for individual wishlist handles/IDs
    let products: WishlistProductItem[] = [];
    if (cleanItems.length > 0) {
      const matchingProducts = allProducts.filter((p) => {
        const pId = p.id.toLowerCase();
        const pHandle = p.handle.toLowerCase();
        return cleanItems.includes(pId) || cleanItems.includes(pHandle);
      });
      products = matchingProducts.map(formatProduct);
    }

    // 3. Match top 3 newest signature works for each requested followed artist slug
    const studioWorks: Record<string, WishlistProductItem[]> = {};
    if (cleanSlugs.length > 0) {
      for (const slug of cleanSlugs) {
        const artistProducts = allProducts.filter((p) => {
          const pSlug = getArtistSlug(p.vendor || "").toLowerCase();
          return pSlug === slug;
        });
        // Explicitly sort by createdAt descending (newest atelier drops first)
        artistProducts.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        studioWorks[slug] = artistProducts.slice(0, 3).map(formatProduct);
      }
    }

    return NextResponse.json({
      success: true,
      products,
      studioWorks,
      totalCount: products.length,
    });
  } catch (error: unknown) {
    console.error("[Wishlist Products API Error]:", error);
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to load wishlisted products.") },
      { status: 500 }
    );
  }
}
