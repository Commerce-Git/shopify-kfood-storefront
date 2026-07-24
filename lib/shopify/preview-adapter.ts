import type { ShopifyProduct, ShopifyImage, ShopifyProductVariant } from "./types";

/**
 * Converts raw preview payload from artist/admin portal into a fully compliant ShopifyProduct object.
 */
export function adaptPreviewToShopifyProduct(payload: any): ShopifyProduct {
  if (!payload) {
    return {
      id: "preview-product-id",
      handle: "preview",
      title: "Untitled Artisan Craft",
      description: "Product description preview...",
      descriptionHtml: "<p>Product description preview...</p>",
      tags: ["preview"],
      vendor: "Master Artisan",
      productType: "Artisan Craft",
      availableForSale: true,
      images: { edges: [] },
      variants: { edges: [] },
      priceRange: {
        minVariantPrice: { amount: "0.00", currencyCode: "USD" },
        maxVariantPrice: { amount: "0.00", currencyCode: "USD" },
      },
    };
  }

  const title = payload.title_en || payload.title || "Handcrafted Masterpiece";
  const vendor = payload.artist || payload.vendor || "Master Artisan";
  const priceAmount = String(payload.price_usd || payload.price || "0.00");
  const rawDescription = payload.description_en || payload.description || "";

  // Append specs to description if material/weight exist
  let descriptionText = rawDescription;
  if (payload.weight_grams) {
    descriptionText += `\n\n⚖️ Weight: ${payload.weight_grams}g`;
  }
  if (payload.material) {
    descriptionText += `\n🧵 Material: ${payload.material}`;
  }

  // Handle photos
  const rawPhotos: string[] = Array.isArray(payload.photos)
    ? payload.photos
    : Array.isArray(payload.images)
    ? payload.images.map((img: any) => (typeof img === "string" ? img : img.url || img.src))
    : [];

  const imagesEdges = rawPhotos
    .filter((url) => typeof url === "string" && url.trim().length > 0)
    .map((url, idx) => ({
      node: {
        url: url.trim(),
        altText: `${title} image ${idx + 1}`,
        width: 1000,
        height: 1000,
      } as ShopifyImage,
    }));

  // Handle variants (if any exist in payload, e.g. color variants or default single variant)
  let variantEdges: { node: ShopifyProductVariant }[] = [];

  if (Array.isArray(payload.variants) && payload.variants.length > 0) {
    variantEdges = payload.variants.map((v: any, idx: number) => ({
      node: {
        id: v.id || `preview-variant-${idx}`,
        title: v.title || v.name || `Option ${idx + 1}`,
        availableForSale: v.availableForSale ?? true,
        price: { amount: String(v.price || priceAmount), currencyCode: "USD" },
        compareAtPrice: v.compareAtPrice ? { amount: String(v.compareAtPrice), currencyCode: "USD" } : null,
        image: v.imageUrl ? { url: v.imageUrl, altText: v.title || title, width: 1000, height: 1000 } : (imagesEdges[0]?.node || null),
        selectedOptions: v.selectedOptions || [{ name: "Option", value: v.title || `Option ${idx + 1}` }],
      },
    }));
  } else if (Array.isArray(payload.color_variants) && payload.color_variants.length > 0) {
    variantEdges = payload.color_variants.map((c: any, idx: number) => ({
      node: {
        id: `preview-color-${idx}`,
        title: c.color_name || c.name || `Color ${idx + 1}`,
        availableForSale: true,
        price: { amount: String(c.price || priceAmount), currencyCode: "USD" },
        compareAtPrice: null,
        image: c.image_url ? { url: c.image_url, altText: c.color_name || title, width: 1000, height: 1000 } : (imagesEdges[0]?.node || null),
        selectedOptions: [{ name: "Color", value: c.color_name || `Color ${idx + 1}` }],
      },
    }));
  } else {
    // Default Single Variant
    variantEdges = [
      {
        node: {
          id: "preview-default-variant",
          title: "Default Title",
          availableForSale: true,
          price: { amount: priceAmount, currencyCode: "USD" },
          compareAtPrice: payload.compare_at_price ? { amount: String(payload.compare_at_price), currencyCode: "USD" } : null,
          image: imagesEdges[0]?.node || null,
          selectedOptions: [{ name: "Title", value: "Default Title" }],
        },
      },
    ];
  }

  return {
    id: payload.id || "preview-product-id",
    handle: payload.handle || "preview-handle",
    title,
    description: descriptionText,
    descriptionHtml: `<p>${descriptionText.replace(/\n/g, "<br/>")}</p>`,
    tags: ["preview", "artisan-craft"],
    vendor,
    productType: payload.category || "Artisan Craft",
    availableForSale: true,
    images: { edges: imagesEdges },
    variants: { edges: variantEdges },
    priceRange: {
      minVariantPrice: { amount: priceAmount, currencyCode: "USD" },
      maxVariantPrice: { amount: priceAmount, currencyCode: "USD" },
    },
  };
}
