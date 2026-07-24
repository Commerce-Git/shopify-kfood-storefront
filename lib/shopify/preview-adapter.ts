import type { ShopifyProduct, ShopifyImage, ShopifyProductVariant } from "./types";

/**
 * Converts raw preview payload from artist/admin portal into a fully compliant ShopifyProduct object.
 */
export function adaptPreviewToShopifyProduct(payload: any): ShopifyProduct {
  const defaultPlaceholderPhotos = [
    "https://cdn.shopify.com/s/files/1/0000/0000/files/placeholder.jpg?v=1",
  ];

  if (!payload) {
    return {
      id: "preview-product-id",
      handle: "preview",
      title: "Korean Traditional Artisan Craft",
      description: "Authentic Korean Handicraft carefully created by master artisans. Ships direct from Seoul, South Korea.",
      descriptionHtml: "<p>Authentic Korean Handicraft carefully created by master artisans. Ships direct from Seoul, South Korea.</p>",
      tags: ["preview", "artisan-craft"],
      vendor: "Master Artisan",
      productType: "Artisan Craft",
      availableForSale: true,
      images: {
        edges: defaultPlaceholderPhotos.map((url, idx) => ({
          node: { url, altText: `Sample image ${idx + 1}`, width: 1000, height: 1000 },
        })),
      },
      variants: {
        edges: [
          {
            node: {
              id: "preview-variant-0",
              title: "Default Title",
              availableForSale: true,
              price: { amount: "79.00", currencyCode: "USD" },
              compareAtPrice: null,
              image: null,
              selectedOptions: [{ name: "Title", value: "Default Title" }],
            },
          },
        ],
      },
      priceRange: {
        minVariantPrice: { amount: "79.00", currencyCode: "USD" },
        maxVariantPrice: { amount: "79.00", currencyCode: "USD" },
      },
    };
  }

  const title = payload.title_en || payload.title || "Korean Traditional Artisan Craft";
  const vendor = payload.artist || payload.vendor || "Master Artisan";
  
  // Use valid USD price if provided and non-zero; otherwise default to clean $79.00 USD
  let priceAmount = "79.00";
  if (payload.price_usd && !isNaN(Number(payload.price_usd)) && Number(payload.price_usd) > 0) {
    priceAmount = Number(payload.price_usd).toFixed(2);
  }

  const rawDescription = payload.description_en || payload.description || "";
  let descriptionText = rawDescription.trim().length > 0
    ? rawDescription
    : `Authentic Korean Handicraft from ${vendor}. Carefully crafted and shipped directly from Seoul, Korea. Free worldwide shipping included.`;

  // Append specs if available
  if (payload.weight_grams && Number(payload.weight_grams) > 0) {
    descriptionText += `\n\n⚖️ Weight: ${payload.weight_grams}g`;
  }
  if (payload.material && payload.material.trim().length > 0) {
    descriptionText += `\n🧵 Material: ${payload.material}`;
  }

  // Handle photo list extraction from all potential fields
  const rawPhotosList: string[] = [];
  
  if (Array.isArray(payload.photos)) {
    rawPhotosList.push(...payload.photos);
  }
  if (Array.isArray(payload.images)) {
    payload.images.forEach((img: any) => {
      if (typeof img === "string") rawPhotosList.push(img);
      else if (img?.url) rawPhotosList.push(img.url);
      else if (img?.src) rawPhotosList.push(img.src);
    });
  }
  if (payload.thumbnail && typeof payload.thumbnail === "string") {
    if (!rawPhotosList.includes(payload.thumbnail)) {
      rawPhotosList.unshift(payload.thumbnail);
    }
  }

  const validPhotos = rawPhotosList
    .filter((url) => typeof url === "string" && url.trim().length > 0 && url !== "pending-blob" && url !== "__blob__")
    .map((url) => url.trim());

  const finalPhotos = validPhotos.length > 0 ? validPhotos : defaultPlaceholderPhotos;

  const imagesEdges = finalPhotos.map((url, idx) => ({
    node: {
      url,
      altText: `${title} image ${idx + 1}`,
      width: 1000,
      height: 1000,
    } as ShopifyImage,
  }));

  // Handle variants
  let variantEdges: { node: ShopifyProductVariant }[] = [];

  if (Array.isArray(payload.color_variants) && payload.color_variants.length > 0) {
    variantEdges = payload.color_variants.map((c: any, idx: number) => ({
      node: {
        id: `preview-color-${idx}`,
        title: c.color_name || c.name || `Color ${idx + 1}`,
        availableForSale: true,
        price: { amount: priceAmount, currencyCode: "USD" },
        compareAtPrice: null,
        image: c.image_url ? { url: c.image_url, altText: c.color_name || title, width: 1000, height: 1000 } : (imagesEdges[0]?.node || null),
        selectedOptions: [{ name: "Color", value: c.color_name || `Color ${idx + 1}` }],
      },
    }));
  } else {
    variantEdges = [
      {
        node: {
          id: "preview-default-variant",
          title: "Default Title",
          availableForSale: true,
          price: { amount: priceAmount, currencyCode: "USD" },
          compareAtPrice: null,
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
