import type { ShopifyProduct } from "@/lib/shopify/types";
import type { EtsyCardItem } from "@/app/components/EtsyHorizontalShelf";

export interface CollectionConfig {
  handle: string;
  title: string;
  shortLabel: string;
  navEmoji: string;
  shelfSubtitle: string;
  aliases: string[];
  keywords: string[];
  productTypeConditions: string[];
  priority: number;
}

/**
 * Master Registry of all 12 Korean Traditional Craft Smart Collections.
 * This is the SINGLE SOURCE OF TRUTH (SSOT) for the entire storefront.
 */
export const MASTER_COLLECTIONS: CollectionConfig[] = [
  {
    handle: "bags-pouches",
    title: "Bags & Pouches",
    shortLabel: "Bags & Pouches",
    navEmoji: "👜",
    shelfSubtitle:
      "Traditional Joseon patterns, Hangul embroidery, and authentic leather Hopae daily carry",
    aliases: ["bags-purses", "bags-wallets", "bags", "pouches", "wallets"],
    keywords: ["bag", "purse", "pouch", "wallet", "tote", "hopae", "drawstring"],
    productTypeConditions: ["Bags & Pouches", "Bag", "Pouch", "Wallet", "Tote"],
    priority: 1,
  },
  {
    handle: "jewelry-charms",
    title: "Jewelry & Charms",
    shortLabel: "Jewelry & Charms",
    navEmoji: "✨",
    shelfSubtitle:
      "Palace Dancheong pigments, mother-of-pearl inlay, and hand-woven silk Daenggi knots",
    aliases: ["charms-keyrings", "jewelry-hair", "charms", "keyrings", "jewelry"],
    keywords: ["charm", "keyring", "strap", "daenggi", "gat", "tassel", "ornament"],
    productTypeConditions: ["Jewelry & Charms", "Keyring", "Charm", "Jewelry"],
    priority: 2,
  },
  {
    handle: "hair-wear",
    title: "Hair Wear",
    shortLabel: "Hair Wear",
    navEmoji: "🎀",
    shelfSubtitle:
      "Botanical floral silk scrunchies and heritage Korean hair ornaments",
    aliases: ["hair", "scrunchies", "hair-accessories", "hairpins"],
    keywords: ["hair", "scrunchie", "hairpin", "binyeo", "daenggi"],
    productTypeConditions: ["Hair Wear", "Hair", "Scrunchie"],
    priority: 3,
  },
  {
    handle: "fabric-living",
    title: "Fabric Living",
    shortLabel: "Fabric Living",
    navEmoji: "🍵",
    shelfSubtitle:
      "Iridescent Sun & Moon Joseon tea coaster sets and heritage living crafts",
    aliases: ["home-living", "home-goods", "home", "fabric", "living"],
    keywords: ["coaster", "tea", "fabric", "mat", "bojagi", "knot", "tableware"],
    productTypeConditions: ["Fabric Living", "Home & Living", "Living"],
    priority: 4,
  },
  {
    handle: "modern-hanbok",
    title: "Modern Hanbok",
    shortLabel: "Modern Hanbok",
    navEmoji: "👘",
    shelfSubtitle:
      "Contemporary reinterpretations of classic Korean silhouette and Jeogori jackets",
    aliases: ["hanbok", "modern-hanbok-clothing", "clothing", "apparel"],
    keywords: ["hanbok", "jeogori", "chima", "robe", "jacket", "korean fashion"],
    productTypeConditions: ["Modern Hanbok", "Hanbok", "Apparel"],
    priority: 5,
  },
  {
    handle: "hanji-stationery",
    title: "Hanji & Stationery",
    shortLabel: "Hanji & Stationery",
    navEmoji: "📜",
    shelfSubtitle:
      "Mulberry Hanji paper notebooks, calligraphy brush sets, and artisan bookmarks",
    aliases: ["stationery-paper", "stationery", "paper", "hanji"],
    keywords: ["stationery", "paper", "hanji", "notebook", "pen", "bookmark", "letter"],
    productTypeConditions: ["Hanji & Stationery", "Stationery", "Paper"],
    priority: 6,
  },
  {
    handle: "ceramics-dining",
    title: "Ceramics & Dining",
    shortLabel: "Ceramics & Dining",
    navEmoji: "🍶",
    shelfSubtitle:
      "Moon jar porcelain vessels, Buncheong celadon teacups, and brass tableware",
    aliases: ["ceramics", "dining", "porcelain", "pottery", "tableware"],
    keywords: ["ceramic", "porcelain", "moon jar", "celadon", "cup", "plate", "bowl"],
    productTypeConditions: ["Ceramics & Dining", "Ceramics", "Dining"],
    priority: 7,
  },
  {
    handle: "woodcraft-najeon",
    title: "Woodcraft & Najeon",
    shortLabel: "Woodcraft & Najeon",
    navEmoji: "🪞",
    shelfSubtitle:
      "Master-crafted mother-of-pearl lacquerware jewelry boxes and carved wooden trays",
    aliases: ["woodcraft", "najeon", "najeonchilgi", "lacquerware"],
    keywords: ["wood", "najeon", "lacquer", "box", "tray", "mother of pearl"],
    productTypeConditions: ["Woodcraft & Najeon", "Woodcraft", "Najeon"],
    priority: 8,
  },
  {
    handle: "metal-decor",
    title: "Metal Decor",
    shortLabel: "Metal Decor",
    navEmoji: "🔔",
    shelfSubtitle:
      "Forged brass wind chimes, door bells, and traditional metallic craft decor",
    aliases: ["metal", "decor", "brass", "chimes"],
    keywords: ["metal", "brass", "bell", "chime", "bronze", "copper"],
    productTypeConditions: ["Metal Decor", "Metal", "Decor"],
    priority: 9,
  },
  {
    handle: "incense-wellness",
    title: "Incense & Wellness",
    shortLabel: "Incense & Wellness",
    navEmoji: "🪵",
    shelfSubtitle:
      "Natural agarwood temple incense sticks, brass burner holders, and herbal wellness",
    aliases: ["incense", "wellness", "aromatherapy", "meditation"],
    keywords: ["incense", "wellness", "burner", "agarwood", "candle", "fragrance"],
    productTypeConditions: ["Incense & Wellness", "Incense", "Wellness"],
    priority: 10,
  },
  {
    handle: "lighting-mood",
    title: "Lighting & Mood",
    shortLabel: "Lighting & Mood",
    navEmoji: "🏮",
    shelfSubtitle:
      "Traditional Hanji mood lamps and ambient ambient Korean accent illumination",
    aliases: ["lighting", "mood", "lamps", "lanterns"],
    keywords: ["lamp", "light", "lantern", "lighting", "illumination", "mood"],
    productTypeConditions: ["Lighting & Mood", "Lighting", "Mood"],
    priority: 11,
  },
];

// Quick Handle-to-Config Map (O(1) lookup)
const HANDLE_MAP = new Map<string, CollectionConfig>();
const ALIAS_MAP = new Map<string, string>();

MASTER_COLLECTIONS.forEach((col) => {
  HANDLE_MAP.set(col.handle, col);
  ALIAS_MAP.set(col.handle, col.handle);
  col.aliases.forEach((alias) => {
    ALIAS_MAP.set(alias, col.handle);
  });
});

/**
 * Resolve any collection handle or legacy alias to the canonical Shopify handle.
 * e.g., "bags-purses" -> "bags-pouches"
 */
export function resolveCollectionHandle(handle: string): string {
  const clean = handle.toLowerCase().trim();
  return ALIAS_MAP.get(clean) || clean;
}

/**
 * Get CollectionConfig by handle or alias.
 */
export function getCollectionConfig(handle: string): CollectionConfig | undefined {
  const canonical = resolveCollectionHandle(handle);
  return HANDLE_MAP.get(canonical);
}

/**
 * Get Top Navigation Links for Header.tsx (Pure Quiet Luxury Typography)
 */
export function getNavLinks(): { href: string; label: string }[] {
  const topCategories = MASTER_COLLECTIONS.slice(0, 4).map((c) => ({
    href: `/collections/${c.handle}`,
    label: c.shortLabel,
  }));

  return [
    ...topCategories,
    { href: "/collections", label: "Shop All" },
    { href: "/artists", label: "Ateliers" },
  ];
}

/**
 * Get Footer Category Links for Footer.tsx
 */
export function getFooterLinks(): { label: string; href: string }[] {
  const topCategories = MASTER_COLLECTIONS.slice(0, 4).map((c) => ({
    label: c.title,
    href: `/collections/${c.handle}`,
  }));

  return [
    ...topCategories,
    { label: "Shop All Collections", href: "/collections" },
    { label: "Verified Seoul Ateliers", href: "/artists" },
  ];
}

/**
 * Get Category Filter Pills for /collections (Shop All) page
 * Prioritizes active categories with live products to maintain a sleek single-row layout.
 */
export function getCategoryFilterPills(): { handle: string; label: string }[] {
  const activeCategories = MASTER_COLLECTIONS.slice(0, 4).map((c) => ({
    handle: c.handle,
    label: `${c.navEmoji} ${c.shortLabel}`,
  }));

  return [
    { handle: "all", label: "✨ All Crafts" },
    ...activeCategories,
  ];
}

/**
 * Map a Shopify Product to an Etsy Shelf Item
 */
function mapProductToEtsyItem(sp: ShopifyProduct): EtsyCardItem {
  const imageUrl = sp.images?.edges?.[0]?.node?.url || "/assets/brand-story-craft.png";
  const priceVal = sp.variants?.edges?.[0]?.node?.price?.amount;
  const compareVal = sp.variants?.edges?.[0]?.node?.compareAtPrice?.amount;

  return {
    id: sp.id,
    title: sp.title,
    handle: sp.handle,
    artist: sp.vendor || "Seoul Artisan",
    price: priceVal ? Number(priceVal).toFixed(2) : "0.00",
    originalPrice: compareVal ? Number(compareVal).toFixed(2) : undefined,
    image: imageUrl,
  };
}

export interface ActiveShelfData {
  config: CollectionConfig;
  id: string;
  title: string;
  subtitle: string;
  items: EtsyCardItem[];
  viewAllHref: string;
}

/**
 * Automatically groups live Shopify products into homepage shelves according to SSOT definitions.
 * Only returns shelves that have at least 1 active product (Auto-Hides 0-product categories).
 */
export function groupProductsIntoShelves(liveProducts: ShopifyProduct[]): ActiveShelfData[] {
  const shelves: ActiveShelfData[] = [];

  for (const config of MASTER_COLLECTIONS) {
    const matchedProducts = liveProducts.filter((p) => {
      const pType = (p.productType || "").toLowerCase().trim();
      const pTitle = (p.title || "").toLowerCase();

      // 1. Primary: Match exact Shopify Smart Collection productTypeCondition
      const matchesType = config.productTypeConditions.some(
        (tc) => pType === tc.toLowerCase() || pType.startsWith(tc.toLowerCase())
      );

      if (matchesType) return true;

      // 2. Fallback: If productType is empty/generic, match specific title keywords
      if (!pType || pType === "default" || pType === "general") {
        return config.keywords.some((kw) => pTitle.includes(kw));
      }

      return false;
    });

    if (matchedProducts.length > 0) {
      shelves.push({
        config,
        id: `shelf-${config.handle}`,
        title: config.title,
        subtitle: config.shelfSubtitle,
        items: matchedProducts.map(mapProductToEtsyItem),
        viewAllHref: `/collections/${config.handle}`,
      });
    }
  }

  // Sort shelves by priority
  return shelves.sort((a, b) => a.config.priority - b.config.priority);
}

/**
 * Find matching shelf DOM ID for real-time header search scrolling.
 * e.g., query "keyring" -> "shelf-jewelry-charms"
 */
export function findMatchingShelfId(query: string): string | null {
  const clean = query.toLowerCase().trim();
  if (!clean) return null;

  for (const config of MASTER_COLLECTIONS) {
    const matchesHandle = config.handle.includes(clean);
    const matchesTitle = config.title.toLowerCase().includes(clean);
    const matchesKeyword = config.keywords.some((kw) => kw.includes(clean) || clean.includes(kw));

    if (matchesHandle || matchesTitle || matchesKeyword) {
      return `shelf-${config.handle}`;
    }
  }

  return null;
}
