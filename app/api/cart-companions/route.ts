import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify/api";
import { extractArtistFromProduct } from "@/lib/artists";

export const dynamic = "force-dynamic";

export interface CompanionProduct {
  variantId: string;
  productHandle: string;
  title: string;
  variantTitle: string;
  price: string;
  image: {
    url: string;
    altText: string;
    width: number;
    height: number;
  };
  artist: {
    slug: string;
    name: string;
    nameKo?: string;
  };
  storyPitch: string;
}

export interface ArtistToFollow {
  slug: string;
  name: string;
  nameKo?: string;
  craftSummary: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handlesParam = searchParams.get("handles") || "";
    const cartHandles = handlesParam
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);

    if (cartHandles.length === 0) {
      return NextResponse.json({
        success: true,
        companions: [],
        artistsToFollow: [],
      });
    }

    // 1. Fetch live products from Shopify
    const allProducts = await getAllProducts(50);

    // 2. Identify artists in current cart
    const cartArtistSlugs = new Set<string>();
    const artistDetailsMap = new Map<string, { slug: string; name: string; nameKo?: string; craft: string }>();

    for (const handle of cartHandles) {
      const matched = allProducts.find((p) => p.handle.toLowerCase() === handle);
      if (matched) {
        const artist = extractArtistFromProduct(matched);
        cartArtistSlugs.add(artist.slug);

        if (!artistDetailsMap.has(artist.slug)) {
          const tags = Array.isArray(matched.tags) ? matched.tags : [];
          const craft =
            matched.productType ||
            (tags.includes("Porcelain") || tags.includes("Ceramic")
              ? "Goryeo Celadon & Ceramics"
              : "Joseon Heritage Crafts");

          artistDetailsMap.set(artist.slug, {
            slug: artist.slug,
            name: artist.name,
            nameKo: artist.nameKo,
            craft,
          });
        }
      }
    }

    // 3. Find available companion products by those same artists outside the cart
    const companions: CompanionProduct[] = [];
    const artistsWithCompanions = new Set<string>();

    for (const product of allProducts) {
      const handleLower = product.handle.toLowerCase();
      // Skip if already in cart
      if (cartHandles.includes(handleLower)) continue;

      // Skip if not available for sale
      if (!product.availableForSale) continue;

      const artist = extractArtistFromProduct(product);
      if (cartArtistSlugs.has(artist.slug)) {
        const firstVariant = product.variants?.edges?.[0]?.node;
        if (!firstVariant) continue;

        const firstImage =
          product.images?.edges?.[0]?.node ||
          firstVariant.image;

        // Quality Gate: Only recommend products that have verified real images
        if (!firstImage || !firstImage.url) continue;

        const productTags = Array.isArray(product.tags) ? product.tags : [];
        // Craft tailored pitch
        let pitch = `Handcrafted companion piece by ${artist.name}`;
        if (productTags.includes("Ceramic") || productTags.includes("Porcelain")) {
          pitch = `Pair with matching studio celadon glaze by ${artist.name}`;
        } else if (productTags.includes("Fabric") || productTags.includes("Keyrings & Bag Charms")) {
          pitch = `Authentic studio creation handcrafted by ${artist.name}`;
        }

        companions.push({
          variantId: firstVariant.id,
          productHandle: product.handle,
          title: product.title,
          variantTitle: firstVariant.title || "Default Title",
          price: parseFloat(firstVariant.price.amount).toFixed(2),
          image: {
            url: firstImage.url,
            altText: firstImage.altText || product.title,
            width: firstImage.width || 500,
            height: firstImage.height || 500,
          },
          artist,
          storyPitch: pitch,
        });

        artistsWithCompanions.add(artist.slug);
      }
    }

    // 4. Identify artists with NO further products available
    const artistsToFollow: ArtistToFollow[] = [];
    for (const slug of cartArtistSlugs) {
      if (!artistsWithCompanions.has(slug)) {
        const details = artistDetailsMap.get(slug);
        if (details) {
          artistsToFollow.push({
            slug: details.slug,
            name: details.name,
            nameKo: details.nameKo,
            craftSummary: details.craft,
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        companions,
        artistsToFollow,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load companions";
    console.error("[Cart Companions API Error]:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
