import type { CartItem } from "@/lib/shopify/types";

export interface UpsellCandidate {
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
  pitch: string;
  emoji: string;
}

// 2026 Curated In-Cart Companion Order Bumps (100% Real Live Shopify Products)
export const UPSELL_CANDIDATES: UpsellCandidate[] = [
  {
    variantId: "gid://shopify/ProductVariant/52855941595448",
    productHandle: "gat-mother-of-pearl-keyring",
    title: "Gat Mother-of-Pearl Keyring",
    variantTitle: "Default Title",
    price: "38.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/fffa8bfa008f4a06b22b52fdbbf8d0e4_512.jpg?v=1787474869",
      altText: "Gat Mother-of-Pearl Keyring",
      width: 500,
      height: 500,
    },
    pitch: "Traditional Joseon Gat hat adorned with shimmering mother-of-pearl",
    emoji: "✨",
  },
  {
    variantId: "gid://shopify/ProductVariant/52838545883448",
    productHandle: "dancheong-tassel-keyring",
    title: "Dancheong Tassel Keyring",
    variantTitle: "Default Title",
    price: "32.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/1787475577145.jpg?v=1787475728",
      altText: "Dancheong Tassel Keyring",
      width: 500,
      height: 500,
    },
    pitch: "Vibrant palace Dancheong pattern with a silk tassel accent",
    emoji: "🏮",
  },
  {
    variantId: "gid://shopify/ProductVariant/52849149477176",
    productHandle: "chrysanthemum-knot-daenggi-keyring",
    title: "Chrysanthemum Knot Daenggi Keyring",
    variantTitle: "Default Title",
    price: "49.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/cf1fc98f78814ae4ade57230a1b18037_512.jpg?v=1787647748",
      altText: "Chrysanthemum Knot Daenggi Keyring",
      width: 500,
      height: 500,
    },
    pitch: "Joseon ribbon charm woven with traditional chrysanthemum knots",
    emoji: "🎀",
  },
  {
    variantId: "gid://shopify/ProductVariant/52834203173176",
    productHandle: "joseon-peony-pattern-card-wallet",
    title: "Joseon Peony Pattern Card Wallet",
    variantTitle: "Default Title",
    price: "32.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/6b2fa81621ab40238edfecff6fbba7b4_512.jpg?v=1787293514",
      altText: "Joseon Peony Pattern Card Wallet",
      width: 500,
      height: 500,
    },
    pitch: "Blue porcelain peony pattern card wallet with dedicated key loop",
    emoji: "🌸",
  },
];

/**
 * Dynamic Contextual Matching: Sort candidates based on current cart items
 */
export function getContextualUpsells(cartItems: CartItem[]): UpsellCandidate[] {
  const hasBagInCart = cartItems.some(
    (i) =>
      i.productHandle.includes("bag") ||
      i.productHandle.includes("pouch") ||
      i.productHandle.includes("tote")
  );
  const hasWalletInCart = cartItems.some(
    (i) =>
      i.productHandle.includes("wallet") ||
      i.productHandle.includes("case") ||
      i.productHandle.includes("hopae")
  );
  const hasFabricInCart = cartItems.some(
    (i) =>
      i.productHandle.includes("fabric") ||
      i.productHandle.includes("knot") ||
      i.productHandle.includes("coaster")
  );

  return [...UPSELL_CANDIDATES].sort((a, b) => {
    if (hasBagInCart) {
      if (a.productHandle === "dancheong-tassel-keyring") return -1;
      if (b.productHandle === "dancheong-tassel-keyring") return 1;
      if (a.productHandle === "chrysanthemum-knot-daenggi-keyring") return -1;
      if (b.productHandle === "chrysanthemum-knot-daenggi-keyring") return 1;
    } else if (hasWalletInCart) {
      if (a.productHandle === "gat-mother-of-pearl-keyring") return -1;
      if (b.productHandle === "gat-mother-of-pearl-keyring") return 1;
      if (a.productHandle === "dancheong-tassel-keyring") return -1;
      if (b.productHandle === "dancheong-tassel-keyring") return 1;
    } else if (hasFabricInCart) {
      if (a.productHandle === "gat-mother-of-pearl-keyring") return -1;
      if (b.productHandle === "gat-mother-of-pearl-keyring") return 1;
      if (a.productHandle === "joseon-peony-pattern-card-wallet") return -1;
      if (b.productHandle === "joseon-peony-pattern-card-wallet") return 1;
    }
    return 0;
  });
}
