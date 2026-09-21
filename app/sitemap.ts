import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/shopify/api";
import { MASTER_COLLECTIONS } from "@/lib/config/collections";
import type { ShopifyProduct } from "@/lib/shopify/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blankseoul.com";

export const revalidate = 3600; // Revalidate sitemap cache every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: ShopifyProduct[] = [];
  try {
    products = await getAllProducts(100);
  } catch (error) {
    console.error("[sitemap] Failed to fetch products:", error);
  }

  // 1. Dynamic Product Pages with Google Lens Image Feeding
  const productEntries: MetadataRoute.Sitemap = products.map((product) => {
    const images = product.images?.edges?.map((e) => e.node.url) || [];
    return {
      url: `${BASE_URL}/product/${encodeURIComponent(product.handle)}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(images.length > 0 ? { images } : {}),
    };
  });

  // 2. Curated Craft Collections Pages (SSOT)
  const collectionEntries: MetadataRoute.Sitemap = MASTER_COLLECTIONS.map((c) => ({
    url: `${BASE_URL}/collections/${c.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 3. Core Static Brand & Discovery Pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/artists`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/policies/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/policies/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/policies/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/policies/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
