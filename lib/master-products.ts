/**
 * Master 8 Standalone Artisan Items & 4 Curated Bundles Definition.
 * Source of Truth: doc/strategy/PRODUCT_CURATION_BUNDLE_STRATEGY.md & doc/master_products_filtered_dump.json
 *
 * Shopify Admin contains ONLY the 8 Master individual items.
 * Curated Bundles (Set D, Set A, Set B, Set C) execute multi-add to cart on the client side.
 */

import type { ShopifyProduct } from "./shopify/types";

export interface MasterProduct {
  sku: string;
  id: string;
  handle: string;
  title: string;
  englishTitle: string;
  price: string;
  compareAtPrice?: string;
  artist: string;
  artistTitle: string;
  studio: string;
  image: string;
  rolloverImage: string;
  category: string;
  craftStatus: string;
  description: string;
}

export interface CuratedBundle {
  id: string;
  sku: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  originalPrice: string;
  savings: string;
  discountCode: string;
  image: string;
  badge: string;
  items: MasterProduct[];
}

// Exact 8 Master Individual Items registered in Shopify Admin
export const MASTER_PRODUCTS: MasterProduct[] = [
  {
    sku: "KMG-01",
    id: "gid://shopify/Product/79dd1bde-abfb-4403-afba-e49bc5d2fa93",
    handle: "gat-yunseul-mother-of-pearl-keyring",
    title: "갓 윤슬 자개 키링",
    englishTitle: "Mother of Pearl Gat Keyring",
    price: "29.00",
    compareAtPrice: "35.00",
    artist: "까마귀 수장고",
    artistTitle: "Najeon Chilgi Master",
    studio: "Kkamagwi Vault • Seoul",
    image: "/assets/idus-products/0520a9fbd8ba4fa0bb34437cae0fe442_512.jpg",
    rolloverImage: "/assets/idus-products/6a74a43c1ccb4d218238e9da1d0dd26a_512.jpg",
    category: "Keyring & Charm",
    craftStatus: "100% Handcrafted",
    description: "Luminous mother-of-pearl inlay brass keyring depicting traditional Korean Gat and shimmering water waves.",
  },
  {
    sku: "MIY-01",
    id: "gid://shopify/Product/44680789-c802-4252-b216-7a9a64a5972e",
    handle: "dabokbag-hanbok-lucky-pouch-wristlet",
    title: "다복백 | 한복 영감 복주머니 손목파우치",
    englishTitle: "Dabokbag Hanbok Lucky Pouch Wristlet",
    price: "32.00",
    compareAtPrice: "38.00",
    artist: "미유 (Miyun)",
    artistTitle: "Hanbok Fabric & Textile Master",
    studio: "Miyun Studio • Seoul",
    image: "/assets/idus-products/f942852c8316492482b7fafc0a949ff6_512.jpg",
    rolloverImage: "/assets/idus-products/106064669200456189b0d03b103b1fda_512.jpg",
    category: "Pouch & Bag",
    craftStatus: "100% Handcrafted",
    description: "Traditional Hanbok-inspired silk wristlet pouch designed for elegant daily carrying.",
  },
  {
    sku: "GOM-01",
    id: "gid://shopify/Product/44cbda13-cf1a-4945-95f0-c57913a46051",
    handle: "joseon-irworobongdo-silk-tea-coaster",
    title: "조선의하루 일월오봉 전통 티코스터",
    englishTitle: "Royal Five Peaks Silk Art Coaster",
    price: "22.00",
    compareAtPrice: "26.00",
    artist: "소심한곰손",
    artistTitle: "Royal Pattern Embroiderer",
    studio: "Gomson Heritage Studio • Seoul",
    image: "/assets/idus-products/b901140d639c45b4b422561fdd4fc91b_512.jpg",
    rolloverImage: "/assets/idus-products/f2074f1d25324ff7b9974838c03c640e_512.jpg",
    category: "Home Décor",
    craftStatus: "Royal Heritage",
    description: "Premium silk tea coaster woven with the sacred Sun, Moon, and Five Peaks royal pattern.",
  },
  {
    sku: "MET-01",
    id: "gid://shopify/Product/34e9c74e-2a38-4f15-b834-047b39f9f9e3",
    handle: "simple-ebony-wood-vine-floral-hairpin",
    title: "심플 넝쿨 흑단 나무 꽃비녀",
    englishTitle: "Ebony Wood Vine Floral Hairpin",
    price: "38.00",
    compareAtPrice: "45.00",
    artist: "메테오장신구",
    artistTitle: "Wood & Carving Master",
    studio: "Meteor Crafts • Seoul",
    image: "/assets/idus-products/3507c206e1be4b7d9ae44c82f458de89_512.jpg",
    rolloverImage: "/assets/idus-products/36b09a3e47e34f189c99ccc10f5074fe_512.jpg",
    category: "Hair Accessory",
    craftStatus: "100% Handcarved",
    description: "Hand-carved natural ebony wooden hairpin decorated with delicate vine floral motifs.",
  },
  {
    sku: "DSN-01",
    id: "gid://shopify/Product/8f8aa9b6-ba4c-4b65-9e87-a07afe7fe4d1",
    handle: "heritage-pattern-jorangi-pony-keyring",
    title: "전통문양 조랑이키링",
    englishTitle: "Heritage Pony Charm Keyring",
    price: "24.00",
    compareAtPrice: "28.00",
    artist: "다솜이네사랑방",
    artistTitle: "Folk Charm Craftsman",
    studio: "Dasom Studio • Seoul",
    image: "/assets/idus-products/cd2619e7f712472d82816db297940c32_512.jpg",
    rolloverImage: "/assets/idus-products/456ac39c515a4d4cae17377a49172baa_512.jpg",
    category: "Keyring & Charm",
    craftStatus: "100% Handcrafted",
    description: "Witty wooden pony charm inspired by Joseon folk illustrations and travel tokens.",
  },
  {
    sku: "BNK-01",
    id: "gid://shopify/Product/e6803b36-97cf-41ec-86f0-981f62a9ab76",
    handle: "traditional-pattern-keyring-card-wallet",
    title: "전통 패턴 키링 명함·카드지갑",
    englishTitle: "Heritage Pattern Keyring Card Wallet",
    price: "35.00",
    compareAtPrice: "42.00",
    artist: "바늘꽃 라라비",
    artistTitle: "Needlework & Fabric Artisan",
    studio: "Lalabee Craft • Seoul",
    image: "/assets/idus-products/658598b88a544bc495616b9220d0e46f_512.jpg",
    rolloverImage: "/assets/idus-products/e9d9c60475444249b6afa11e8f782ec1_512.jpg",
    category: "Wallet & Case",
    craftStatus: "100% Handcrafted",
    description: "Compact traditional pattern card wallet with integrated keyring attachment.",
  },
  {
    sku: "SHM-01",
    id: "gid://shopify/Product/0379fdc7-1461-4a71-a77c-06384139eb4c",
    handle: "traditional-pattern-norigae-keyring",
    title: "전통문양 노리개키링",
    englishTitle: "Silk Norigae Tassel Keyring",
    price: "27.00",
    compareAtPrice: "32.00",
    artist: "수희마켓",
    artistTitle: "Heritage Knot Craftsman",
    studio: "Suhee Market • Seoul",
    image: "/assets/idus-products/0520a9fbd8ba4fa0bb34437cae0fe442_512.jpg",
    rolloverImage: "/assets/idus-products/1c313831722948b594d6f897d458109f_512.jpg",
    category: "Keyring & Charm",
    craftStatus: "Made to Order",
    description: "Intricately hand-tied traditional Norigae tassel keyring representing health and good fortune.",
  },
  {
    sku: "HSR-01",
    id: "gid://shopify/Product/89b3ac6a-7e33-409c-a854-2410853a17f7",
    handle: "mini-bobusang-hanbok-heritage-tote",
    title: "🥇전통 가방 ✔📣미니 보부상 🇰🇷 한복가방",
    englishTitle: "Mini Bobusang Heritage Tote",
    price: "39.00",
    compareAtPrice: "46.00",
    artist: "힙서리",
    artistTitle: "Hip K-Culture Artisan",
    studio: "Hipseori Studio • Seoul",
    image: "/assets/idus-products/ab7ac6d488d44d3f98ace048925f8e3b_512.jpg",
    rolloverImage: "/assets/idus-products/064c91003ab341cc9a19fc042a603b77_512.jpg",
    category: "Pouch & Bag",
    craftStatus: "Gold Medalist Craft",
    description: "Hip modern Hanbok tote bag inspired by traditional Joseon peddler Bobusang bags.",
  },
];

// Helper map by SKU
export const MASTER_PRODUCTS_BY_SKU: Record<string, MasterProduct> = MASTER_PRODUCTS.reduce(
  (acc, item) => {
    acc[item.sku] = item;
    return acc;
  },
  {} as Record<string, MasterProduct>
);

// Active 4 Curated Bundles ordered by Sales Funnel Priority: Set D ($89) -> Set A ($59) -> Set B ($72) -> Set C ($54)
export const CURATED_BUNDLES: CuratedBundle[] = [
  {
    id: "set-d",
    sku: "SET-D",
    name: "Set D: Mini Bobusang Heritage Tote Combo",
    tagline: "Hanbok Heritage Tote, Norigae & Card Wallet",
    description: "Flagship 3-piece fashion carry set featuring Mini Bobusang Hanbok tote, traditional Norigae keyring, and card wallet.",
    price: "89.00",
    originalPrice: "101.00",
    savings: "12.00",
    discountCode: "SETD_DISCOUNT",
    image: "/assets/idus-products/ab7ac6d488d44d3f98ace048925f8e3b_512.jpg",
    badge: "Flagship Tote • Save $12",
    items: [
      MASTER_PRODUCTS_BY_SKU["HSR-01"],
      MASTER_PRODUCTS_BY_SKU["SHM-01"],
      MASTER_PRODUCTS_BY_SKU["BNK-01"],
    ],
  },
  {
    id: "set-a",
    sku: "SET-A",
    name: "Set A: Korean Heritage Pouch & Wallet Duo",
    tagline: "Compact Pouch & Card Wallet Carry Duo",
    description: "Refined 2-piece handcrafted carry duo combining silk Dabokbag wristlet pouch and leather card wallet.",
    price: "59.00",
    originalPrice: "67.00",
    savings: "8.00",
    discountCode: "SETA_DISCOUNT",
    image: "/assets/idus-products/f942852c8316492482b7fafc0a949ff6_512.jpg",
    badge: "Compact Duo • Save $8",
    items: [
      MASTER_PRODUCTS_BY_SKU["MIY-01"],
      MASTER_PRODUCTS_BY_SKU["BNK-01"],
    ],
  },
  {
    id: "set-b",
    sku: "SET-B",
    name: "Set B: Heritage Charm & Keyring Trio Collection",
    tagline: "Bag Charm Layering & Friendship Trio",
    description: "Curated 3-piece accessory trio combining Gat mother-of-pearl keyring, Joseon pony charm, and Norigae tassel keyring.",
    price: "72.00",
    originalPrice: "80.00",
    savings: "8.00",
    discountCode: "SETB_DISCOUNT",
    image: "/assets/idus-products/0520a9fbd8ba4fa0bb34437cae0fe442_512.jpg",
    badge: "Best Value • Save $8",
    items: [
      MASTER_PRODUCTS_BY_SKU["KMG-01"],
      MASTER_PRODUCTS_BY_SKU["DSN-01"],
      MASTER_PRODUCTS_BY_SKU["SHM-01"],
    ],
  },
  {
    id: "set-c",
    sku: "SET-C",
    name: "Set C: Joseon Classic Home & Beauty Duo",
    tagline: "Royal Tea Coaster & Ebony Wood Floral Hairpin",
    description: "Elegant 2-piece living set combining royal Irworobongdo silk coaster and hand-carved ebony wood floral hairpin.",
    price: "54.00",
    originalPrice: "60.00",
    savings: "6.00",
    discountCode: "SETC_DISCOUNT",
    image: "/assets/idus-products/3507c206e1be4b7d9ae44c82f458de89_512.jpg",
    badge: "Classic Duo • Save $6",
    items: [
      MASTER_PRODUCTS_BY_SKU["GOM-01"],
      MASTER_PRODUCTS_BY_SKU["MET-01"],
    ],
  },
];

/**
 * Dynamically hydrate master product images from live Shopify Storefront API response.
 * If live products are returned from Shopify API, replaces the local fallback images
 * with real Shopify Admin CDN image URLs.
 */
export function hydrateMasterProducts(liveShopifyProducts: ShopifyProduct[]): MasterProduct[] {
  if (!liveShopifyProducts || liveShopifyProducts.length === 0) {
    return MASTER_PRODUCTS;
  }

  return MASTER_PRODUCTS.map((master) => {
    // Find matching Shopify product by handle or title keyword
    const match = liveShopifyProducts.find(
      (sp) =>
        sp.handle === master.handle ||
        sp.title.toLowerCase().includes(master.title.toLowerCase()) ||
        sp.title.toLowerCase().includes(master.sku.toLowerCase())
    );

    if (match && match.images?.edges?.[0]?.node?.url) {
      const liveImage = match.images.edges[0].node.url;
      const liveRollover = match.images.edges[1]?.node?.url || liveImage;
      const liveVariantId = match.variants?.edges?.[0]?.node?.id || master.id;

      return {
        ...master,
        id: liveVariantId,
        image: liveImage,
        rolloverImage: liveRollover,
      };
    }

    return master;
  });
}
