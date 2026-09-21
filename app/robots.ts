import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blankseoul.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/cart",
          "/checkout",
          "/account/",
          "/review",
          "/order-lookup",
          "/unsubscribe",
          "/wishlist",
        ],
      },
      {
        // 2026 AI Search & Discovery Bots (Generative Engine Optimization)
        userAgent: [
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
          "Amazonbot",
          "Bytespider",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow: [
          "/api/",
          "/cart",
          "/checkout",
          "/account/",
          "/review",
          "/order-lookup",
          "/unsubscribe",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
