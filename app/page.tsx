import EtsyHorizontalShelf from "./components/EtsyHorizontalShelf";
import EtsyEditorialSplitBanner from "./components/EtsyEditorialSplitBanner";
import AtelierSpotlight from "./components/AtelierSpotlight";
import { getAllProducts } from "@/lib/shopify/api";
import { getEnrichedArtistsWithProducts } from "@/lib/artists";
import { groupProductsIntoShelves } from "@/lib/config/collections";
import { isStoreLive } from "@/lib/constants";

interface HomePageProps {
  searchParams?: Promise<{
    mode?: string;
    preview?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const modeOverride = resolvedParams?.mode?.toLowerCase();
  const previewParam = resolvedParams?.preview?.toLowerCase();

  // If ?mode=live -> live, if ?mode=preview or ?preview=true -> preview, else default to isStoreLive()
  let isLive = isStoreLive();
  if (modeOverride === "live") {
    isLive = true;
  } else if (modeOverride === "preview" || previewParam === "true" || previewParam === "1") {
    isLive = false;
  }

  // Fetch all live products directly from Shopify Storefront API
  const liveProducts = await getAllProducts(50);
  const enrichedArtists = await getEnrichedArtistsWithProducts(liveProducts);

  // Group live products dynamically into SSOT shelves (Auto-Hides 0-product shelves)
  const shelves = groupProductsIntoShelves(liveProducts);

  return (
    <div className="relative w-full flex-1 bg-[#FFFFFF] text-[#18181B] overflow-hidden">
      {/* 2026 Semantic Topic Anchor for Search Engines & Screen Readers */}
      <h1 className="sr-only">
        Made in Korea. Shipped from Korea. | BLANK SEOUL
      </h1>

      {/* 1. Preview Mode: Opening Soon Manifesto Banner placed at the very top (Hero Hook & Story) */}
      {!isLive && <EtsyEditorialSplitBanner isHero={true} isLive={isLive} />}

      {shelves.map((shelf, index) => (
        <div key={shelf.id}>
          <EtsyHorizontalShelf
            id={shelf.id}
            title={shelf.title}
            subtitle={shelf.subtitle}
            items={shelf.items}
            viewAllHref={shelf.viewAllHref}
          />
          {/* 2. Live Mode: Insert Editorial Split Banner right after the 1st shelf (Golden Ratio) */}
          {isLive && index === 0 && <EtsyEditorialSplitBanner isHero={false} isLive={isLive} />}
        </div>
      ))}

      {/* If shelves is empty and in live mode, render banner as fallback */}
      {shelves.length === 0 && isLive && <EtsyEditorialSplitBanner isHero={false} isLive={isLive} />}

      {/* Partner Studios Showcase */}
      <AtelierSpotlight artists={enrichedArtists.map((a) => a.profile)} />
    </div>
  );
}
