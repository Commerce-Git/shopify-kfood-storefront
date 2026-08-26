import EtsyHorizontalShelf, { EtsyCardItem } from "./components/EtsyHorizontalShelf";
import EtsyEditorialSplitBanner from "./components/EtsyEditorialSplitBanner";
import AtelierSpotlight from "./components/AtelierSpotlight";
import { getAllProducts } from "@/lib/shopify/api";
import { getEnrichedArtistsWithProducts } from "@/lib/artists";
import type { ShopifyProduct } from "@/lib/shopify/types";

// Helper to map live Shopify product to Etsy card item
function mapShopifyToCard(sp: ShopifyProduct): EtsyCardItem {
  const imageUrl = sp.images?.edges?.[0]?.node?.url || "/assets/brand-story-craft.png";
  const priceVal = sp.variants?.edges?.[0]?.node?.price?.amount;
  const compareVal = sp.variants?.edges?.[0]?.node?.compareAtPrice?.amount;

  const priceFormatted = priceVal ? Number(priceVal).toFixed(2) : "0.00";
  const originalFormatted = compareVal ? Number(compareVal).toFixed(2) : undefined;

  return {
    id: sp.id,
    title: sp.title,
    handle: sp.handle,
    artist: sp.vendor || "Seoul Artisan",
    price: priceFormatted,
    originalPrice: originalFormatted,
    image: imageUrl,
  };
}

export default async function Home() {
  // Fetch all live products directly from Shopify Storefront API
  const liveProducts = await getAllProducts(50);
  const enrichedArtists = await getEnrichedArtistsWithProducts(liveProducts);

  // Group 1: Bags & Purses (Matching Shopify Smart Rule)
  const bagsAndPurses: EtsyCardItem[] = liveProducts
    .filter((p) => {
      const type = (p.productType || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return (
        type.includes("bag") ||
        type.includes("purse") ||
        type.includes("pouch") ||
        type.includes("wallet") ||
        title.includes("wallet") ||
        title.includes("bag") ||
        title.includes("pouch") ||
        title.includes("tote")
      );
    })
    .map(mapShopifyToCard);

  // Group 2: Charms & Keyrings (Matching Shopify Smart Rule)
  const charmsAndKeyrings: EtsyCardItem[] = liveProducts
    .filter((p) => {
      const type = (p.productType || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return (
        type.includes("charm") ||
        type.includes("keyring") ||
        title.includes("keyring") ||
        title.includes("strap") ||
        title.includes("daenggi")
      );
    })
    .map(mapShopifyToCard);

  // Group 3: Jewelry & Hair (Matching Shopify Smart Rule)
  const jewelryAndHair: EtsyCardItem[] = liveProducts
    .filter((p) => {
      const type = (p.productType || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return (
        type.includes("hair") ||
        type.includes("jewelry") ||
        title.includes("scrunchie") ||
        title.includes("hair")
      );
    })
    .map(mapShopifyToCard);

  // Group 4: Home & Living (Matching Shopify Smart Rule)
  const homeAndLiving: EtsyCardItem[] = liveProducts
    .filter((p) => {
      const type = (p.productType || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return (
        type.includes("home") ||
        type.includes("living") ||
        type.includes("goods") ||
        title.includes("coaster") ||
        title.includes("tea") ||
        title.includes("fabric") ||
        title.includes("mat")
      );
    })
    .map(mapShopifyToCard);

  // Group 5: Stationery & Paper (Matching Shopify Smart Rule)
  const stationeryAndPaper: EtsyCardItem[] = liveProducts
    .filter((p) => {
      const type = (p.productType || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return (
        type.includes("stationery") ||
        type.includes("paper") ||
        title.includes("notebook") ||
        title.includes("pen") ||
        title.includes("postcard")
      );
    })
    .map(mapShopifyToCard);

  // Group 6: Art & Objects (Matching Shopify Smart Rule)
  const artAndObjects: EtsyCardItem[] = liveProducts
    .filter((p) => {
      const type = (p.productType || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return (
        type.includes("art") ||
        type.includes("object") ||
        title.includes("ceramic") ||
        title.includes("woodcraft") ||
        title.includes("sculpture")
      );
    })
    .map(mapShopifyToCard);

  return (
    <div className="relative w-full bg-[#FFFFFF] text-[#18181B] overflow-hidden pt-28 sm:pt-36">
      {/* 1. Bags & Purses (Auto-Hidden if 0) */}
      {bagsAndPurses.length > 0 && (
        <EtsyHorizontalShelf
          id="shelf-bags"
          title="Bags & Purses"
          subtitle="Traditional Joseon patterns, Hangul embroidery, and authentic leather Hopae daily carry"
          items={bagsAndPurses}
          viewAllHref="/collections/bags-purses"
        />
      )}

      {/* 2. Mid-Page Editorial Story Split Banner */}
      <EtsyEditorialSplitBanner />

      {/* 3. Charms & Keyrings (Auto-Hidden if 0) */}
      {charmsAndKeyrings.length > 0 && (
        <EtsyHorizontalShelf
          id="shelf-charms"
          title="Charms & Keyrings"
          subtitle="Palace Dancheong pigments, mother-of-pearl inlay, and hand-woven silk Daenggi knots"
          items={charmsAndKeyrings}
          viewAllHref="/collections/charms-keyrings"
        />
      )}

      {/* 4. Jewelry & Hair (Auto-Hidden if 0) */}
      {jewelryAndHair.length > 0 && (
        <EtsyHorizontalShelf
          id="shelf-jewelry"
          title="Jewelry & Hair"
          subtitle="Botanical floral silk scrunchies and heritage Korean hair ornaments"
          items={jewelryAndHair}
          viewAllHref="/collections/jewelry-hair"
        />
      )}

      {/* 5. Home & Living (Auto-Hidden if 0) */}
      {homeAndLiving.length > 0 && (
        <EtsyHorizontalShelf
          id="shelf-home"
          title="Home & Living"
          subtitle="Iridescent Sun & Moon Joseon tea coaster sets and heritage living crafts"
          items={homeAndLiving}
          viewAllHref="/collections/home-living"
        />
      )}

      {/* 6. Stationery & Paper (Auto-Hidden if 0) */}
      {stationeryAndPaper.length > 0 && (
        <EtsyHorizontalShelf
          id="shelf-stationery"
          title="Stationery & Paper"
          subtitle="Artisan Hanji notebooks, calligraphic craft, and heritage desk stationery"
          items={stationeryAndPaper}
          viewAllHref="/collections/stationery-paper"
        />
      )}

      {/* 7. Art & Objects (Auto-Hidden if 0) */}
      {artAndObjects.length > 0 && (
        <EtsyHorizontalShelf
          id="shelf-art"
          title="Art & Objects"
          subtitle="Sculptural Korean ceramics, master woodwork, and fine craft objects"
          items={artAndObjects}
          viewAllHref="/collections/art-objects"
        />
      )}

      {/* 8. Partner Studios Showcase */}
      <AtelierSpotlight artists={enrichedArtists.map((a) => a.profile)} />
    </div>
  );
}
