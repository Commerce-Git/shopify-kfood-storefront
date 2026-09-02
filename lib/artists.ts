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

export interface ArtistWithProducts {
  profile: ArtistProfile;
  worksCount: number;
  products: any[];
  highlightImage: string;
}

// Vendor to Slug mapping dictionary for common Korean vendor names
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
  // Generic slug generator for dynamically discovered vendors
  return trimmed
    .toLowerCase()
    .replace(/[^\w\s-가-힣]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "artisan";
}

/**
 * Generate a dynamic artist profile for any vendor or slug
 */
export function getArtistBySlug(slug: string): ArtistProfile {
  const normalized = slug.toLowerCase();

  // Format readable name from slug
  const readableName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    slug: normalized,
    name: readableName,
    nameEn: `${readableName} Studio`,
    discipline: "Korean Heritage Craft & Goods",
    location: "Seoul, South Korea",
    bio: `Independent Korean master studio and verified workshop creating authentic pieces in Korea. Every work is crafted with traditional heritage and modern design.`,
    avatar: "/assets/blank_seoul_symbol.png",
    coverImage: "/assets/korean_artisan_crafts_hero.jpg",
    specialties: ["Made in Korea", "Authentic Quality", "Verified Studio"],
  };
}

/**
 * Aggregate live Shopify products into unique artist studios
 * Only returns artists that actually have live products
 */
export function getAllArtistsWithProducts(products: any[] = []): ArtistWithProducts[] {
  const artistMap = new Map<string, { profile: ArtistProfile; products: any[] }>();

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

  for (const [, data] of artistMap.entries()) {
    if (data.products.length > 0) {
      const firstProductImg = data.products[0]?.images?.edges?.[0]?.node?.url;
      result.push({
        profile: data.profile,
        worksCount: data.products.length,
        products: data.products,
        highlightImage: firstProductImg || data.profile.coverImage || data.profile.avatar,
      });
    }
  }

  // Sort by works count descending
  return result.sort((a, b) => b.worksCount - a.worksCount);
}

/**
 * Supabase DB(artist_accounts) 및 Shopify 실시간 상품을 결합한 100% 동적 작가 목록 반환
 */
export async function getEnrichedArtistsWithProducts(products: any[] = []): Promise<ArtistWithProducts[]> {
  const artistMap = new Map<string, ArtistWithProducts>();

  // 1. Group live Shopify products
  const liveArtists = getAllArtistsWithProducts(products);
  for (const item of liveArtists) {
    artistMap.set(item.profile.slug, item);
  }

  // 2. Query Supabase DB artist_accounts
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const { data: dbAccounts } = await supabaseAdmin
      .from("artist_accounts")
      .select("artist_name, artist_name_en, avatar_url, bio, specialties, discipline, location");

    if (dbAccounts && dbAccounts.length > 0) {
      for (const dbAcc of dbAccounts) {
        const slug = getArtistSlug(dbAcc.artist_name || dbAcc.artist_name_en || "");
        if (!slug || slug === "artisan") continue;

        if (artistMap.has(slug)) {
          // Enrich existing live artist
          const item = artistMap.get(slug)!;
          if (dbAcc.artist_name) item.profile.name = dbAcc.artist_name;
          if (dbAcc.artist_name_en) item.profile.nameEn = dbAcc.artist_name_en;
          if (dbAcc.avatar_url) item.profile.avatar = dbAcc.avatar_url;
          if (dbAcc.bio) item.profile.bio = dbAcc.bio;
          if (dbAcc.discipline) item.profile.discipline = dbAcc.discipline;
          if (dbAcc.location) item.profile.location = dbAcc.location;
        } else {
          // Add DB artist even if 0 products yet
          const profile: ArtistProfile = {
            slug,
            name: dbAcc.artist_name || slug,
            nameEn: dbAcc.artist_name_en || `${slug} Studio`,
            discipline: dbAcc.discipline || "Korean Heritage Craft & Goods",
            location: dbAcc.location || "Seoul, South Korea",
            bio: dbAcc.bio || "Independent Korean artisan studio verified by Blank Seoul.",
            avatar: dbAcc.avatar_url || "/assets/blank_seoul_symbol.png",
            coverImage: "/assets/korean_artisan_crafts_hero.jpg",
            specialties: Array.isArray(dbAcc.specialties) ? dbAcc.specialties : ["Made in Korea", "Verified Studio"],
          };
          artistMap.set(slug, {
            profile,
            worksCount: 0,
            products: [],
            highlightImage: profile.avatar,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Failed to fetch artist_accounts from Supabase DB:", err);
  }

  return Array.from(artistMap.values()).sort((a, b) => b.worksCount - a.worksCount);
}

/**
 * Supabase DB(artist_accounts)에서 최신 정보를 결합한 단일 작가 프로필 반환
 */
export async function getEnrichedArtistBySlug(slug: string): Promise<ArtistProfile> {
  const profile = getArtistBySlug(slug);

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const { data: dbAccounts } = await supabaseAdmin
      .from("artist_accounts")
      .select("artist_name, artist_name_en, avatar_url, bio, discipline, location, specialties");

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
        if (match.artist_name_en) profile.nameEn = match.artist_name_en;
        if (match.avatar_url) profile.avatar = match.avatar_url;
        if (match.bio) profile.bio = match.bio;
        if (match.discipline) profile.discipline = match.discipline;
        if (match.location) profile.location = match.location;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch single artist from DB:", err);
  }

  if (!profile.avatar || profile.avatar.trim() === "") {
    profile.avatar = "/assets/blank_seoul_symbol.png";
  }

  return profile;
}
