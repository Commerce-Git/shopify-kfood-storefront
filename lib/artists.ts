export interface ArtistProfile {
  slug: string;
  name: string;
  nameEn: string;
  discipline: string;
  location: string;
  bio: string;
  avatar: string;
  coverImage: string;
  specialties: string[];
  established?: string;
  instagram?: string;
}

export const VERIFIED_ARTISTS: Record<string, ArtistProfile> = {
  lalabi: {
    slug: "lalabi",
    name: "바늘꽃 라라비",
    nameEn: "LALAVI",
    discipline: "Traditional Silk & Fabric Embroidery",
    location: "Seoul, South Korea",
    bio: "Translating classical Korean floral patterns, Hunminjeongeum Hangul calligraphy, and functional fabric crafts into versatile modern bags, pouches, and hair accessories.",
    avatar: "/assets/blank_seoul_symbol.png",
    coverImage: "/assets/ecobag_belly_band_packaging.jpg",
    specialties: ["Hangul Embroidery", "3-Way Transform Bag", "Bokjumeoni Pouch", "Floral Scrunchies"],
    established: "2021",
  },
  kkamagwi: {
    slug: "kkamagwi",
    name: "까마귀 수장고",
    nameEn: "Crow's Repository",
    discipline: "Joseon Knots & Heritage Mother-of-Pearl",
    location: "Bukchon Hanok Village, Seoul",
    bio: "Specializing in royal Gukwha chrysanthemum knots, Gat mother-of-pearl crafts, and genuine handcrafted leather Hopae wallets that bridge Joseon antiquity with modern daily carry.",
    avatar: "/assets/blank_seoul_symbol.png",
    coverImage: "/assets/hopae_wallet_gift_box.jpg",
    specialties: ["Mother-of-Pearl Inlay", "Joseon Hopae Leather", "Silk Knotting"],
    established: "2019",
  },
  miyu: {
    slug: "miyu",
    name: "미유",
    nameEn: "meyou",
    discipline: "Dancheong Pigments & Korean Folk Art",
    location: "Seoul, South Korea",
    bio: "Capturing the vibrant sacred pigments of Korean palace Dancheong and auspicious Korean folk tigers into playful daily wallets, straps, and protective charms.",
    avatar: "/assets/blank_seoul_symbol.png",
    coverImage: "/assets/korean_craft_matte_packaging.jpg",
    specialties: ["Folk Tiger Embroidery", "Dancheong Straps", "Temple Pigment Charms"],
    established: "2022",
  },
  "sosimhan-gomson": {
    slug: "sosimhan-gomson",
    name: "소심한곰손",
    nameEn: "Sosimhan Gomson",
    discipline: "Joseon Textile & Living Home Goods",
    location: "Seoul, South Korea",
    bio: "Infusing iridescent traditional fabrics and cosmic Joseon symbols (Sun, Moon & Five Peaks) into poetic everyday home and dining accessories.",
    avatar: "/assets/blank_seoul_symbol.png",
    coverImage: "/assets/brand-story-craft.png",
    specialties: ["Iridescent Fabrics", "Sun & Moon Coasters", "Heritage Dining Goods"],
    established: "2023",
  },
};

// Vendor to Slug mapping
const VENDOR_TO_SLUG_MAP: Record<string, string> = {
  "바늘꽃 라라비": "lalabi",
  "바늘꽃라라비": "lalabi",
  "Lalabi": "lalabi",
  "Lalabi Studio": "lalabi",
  "까마귀 수장고": "kkamagwi",
  "까마귀수장고": "kkamagwi",
  "Kkamagwi": "kkamagwi",
  "Kkamagwi Atelier": "kkamagwi",
  "미유": "miyu",
  "Miyu": "miyu",
  "Miyu Art Atelier": "miyu",
  "소심한곰손": "sosimhan-gomson",
  "소심한 곰손": "sosimhan-gomson",
  "Sosimhan Gomson": "sosimhan-gomson",
};

/**
 * Get slug from vendor name with automatic fallback
 */
export function getArtistSlug(vendor: string = ""): string {
  const trimmed = vendor.trim();
  if (VENDOR_TO_SLUG_MAP[trimmed]) {
    return VENDOR_TO_SLUG_MAP[trimmed];
  }
  // Generic slug generator for future unlisted vendors
  return trimmed
    .toLowerCase()
    .replace(/[^\w\s-가-힣]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "artisan";
}

/**
 * Get artist profile by slug with automatic fallback for new vendors
 */
export function getArtistBySlug(slug: string): ArtistProfile {
  const normalized = slug.toLowerCase();
  if (VERIFIED_ARTISTS[normalized]) {
    return VERIFIED_ARTISTS[normalized];
  }

  // Look up by matching vendor name
  for (const [vendor, s] of Object.entries(VENDOR_TO_SLUG_MAP)) {
    if (s === normalized) {
      return VERIFIED_ARTISTS[s];
    }
  }

  // Fallback profile for dynamically discovered new artists
  const readableName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    slug: normalized,
    name: readableName,
    nameEn: `${readableName} Studio`,
    discipline: "Handcrafted Korean Craft",
    location: "Seoul, South Korea",
    bio: `Independent Korean craft master creating authentic handmade pieces in Seoul. Every work is crafted with traditional heritage and modern utility.`,
    avatar: "/assets/blank_seoul_symbol.png",
    coverImage: "/assets/korean_artisan_crafts_hero.jpg",
    specialties: ["Handmade in Seoul", "100% Authentic", "Verified Studio"],
  };
}

export interface ArtistWithProducts {
  profile: ArtistProfile;
  worksCount: number;
  products: any[];
  highlightImage: string;
}

/**
 * Aggregate all live Shopify products into unique artist studios
 * 100% automated and future-proof for 1,000+ artists
 */
export function getAllArtistsWithProducts(products: any[] = []): ArtistWithProducts[] {
  const artistMap = new Map<string, { profile: ArtistProfile; products: any[] }>();

  // Initialize verified artists
  for (const [slug, profile] of Object.entries(VERIFIED_ARTISTS)) {
    artistMap.set(slug, { profile, products: [] });
  }

  // Aggregate live Shopify products
  for (const product of products) {
    const vendor = product.vendor || "Seoul Artisan";
    const slug = getArtistSlug(vendor);
    
    if (!artistMap.has(slug)) {
      const profile = getArtistBySlug(slug);
      profile.name = vendor;
      artistMap.set(slug, { profile, products: [] });
    }

    artistMap.get(slug)!.products.push(product);
  }

  // Transform into sorted array
  const result: ArtistWithProducts[] = [];

  for (const [slug, data] of artistMap.entries()) {
    const isVerified = Boolean(VERIFIED_ARTISTS[slug]);
    // Include if it's a verified artist OR has at least 1 product
    if (isVerified || data.products.length > 0) {
      const firstProductImg = data.products[0]?.images?.edges?.[0]?.node?.url;
      result.push({
        profile: data.profile,
        worksCount: data.products.length,
        products: data.products,
        highlightImage: firstProductImg || data.profile.coverImage || data.profile.avatar,
      });
    }
  }

  // Sort: verified artists first, then by works count descending
  return result.sort((a, b) => {
    const aVerified = Boolean(VERIFIED_ARTISTS[a.profile.slug]);
    const bVerified = Boolean(VERIFIED_ARTISTS[b.profile.slug]);
    if (aVerified && !bVerified) return -1;
    if (!aVerified && bVerified) return 1;
    return b.worksCount - a.worksCount;
  });
}

/**
 * Supabase DB(artist_accounts)에서 최신 아바타, 영문명 및 바이오를 결합한 작가 목록 반환
 */
export async function getEnrichedArtistsWithProducts(products: any[] = []): Promise<ArtistWithProducts[]> {
  const baseArtists = getAllArtistsWithProducts(products);

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const { data: dbAccounts } = await supabaseAdmin
      .from("artist_accounts")
      .select("artist_name, artist_name_en, avatar_url, bio");

    if (dbAccounts && dbAccounts.length > 0) {
      const accountMap = new Map(dbAccounts.map((a) => [a.artist_name, a]));

      for (const item of baseArtists) {
        const dbAcc = accountMap.get(item.profile.name);
        if (dbAcc) {
          if (dbAcc.artist_name_en && dbAcc.artist_name_en.trim() !== "") {
            item.profile.nameEn = dbAcc.artist_name_en.trim();
          }
          if (dbAcc.avatar_url && dbAcc.avatar_url.trim() !== "") {
            item.profile.avatar = dbAcc.avatar_url;
            if (!item.highlightImage || item.highlightImage.includes("/assets/")) {
              item.highlightImage = dbAcc.avatar_url;
            }
          }
          if (dbAcc.bio) {
            item.profile.bio = dbAcc.bio;
          }
        }
        if (!item.profile.avatar || item.profile.avatar.trim() === "") {
          item.profile.avatar = "/assets/blank_seoul_symbol.png";
        }
      }
    }
  } catch (err) {
    console.warn("Failed to fetch artist_accounts from DB in storefront, using defaults:", err);
  }

  return baseArtists;
}

/**
 * Supabase DB(artist_accounts)에서 최신 아바타, 영문명 및 바이오를 결합한 단일 작가 프로필 반환
 */
export async function getEnrichedArtistBySlug(slug: string): Promise<ArtistProfile> {
  const profile = getArtistBySlug(slug);

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const { data: dbAccounts } = await supabaseAdmin
      .from("artist_accounts")
      .select("artist_name, artist_name_en, avatar_url, bio");

    if (dbAccounts && dbAccounts.length > 0) {
      const normalizedSlug = slug.toLowerCase();
      const match = dbAccounts.find((a) => {
        return (
          a.artist_name === profile.name ||
          getArtistSlug(a.artist_name) === normalizedSlug ||
          (a.artist_name_en && getArtistSlug(a.artist_name_en) === normalizedSlug)
        );
      });

      if (match) {
        if (match.artist_name) profile.name = match.artist_name;
        if (match.artist_name_en && match.artist_name_en.trim() !== "") profile.nameEn = match.artist_name_en.trim();
        if (match.avatar_url && match.avatar_url.trim() !== "") profile.avatar = match.avatar_url;
        if (match.bio) profile.bio = match.bio;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch single artist from DB in storefront:", err);
  }

  if (!profile.avatar || profile.avatar.trim() === "") {
    profile.avatar = "/assets/blank_seoul_symbol.png";
  }

  return profile;
}


