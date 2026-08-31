import EtsyHorizontalShelf from "./components/EtsyHorizontalShelf";
import EtsyEditorialSplitBanner from "./components/EtsyEditorialSplitBanner";
import AtelierSpotlight from "./components/AtelierSpotlight";
import { getAllProducts } from "@/lib/shopify/api";
import { getEnrichedArtistsWithProducts } from "@/lib/artists";
import { groupProductsIntoShelves } from "@/lib/config/collections";

export default async function Home() {
  // Fetch all live products directly from Shopify Storefront API
  const liveProducts = await getAllProducts(50);
  const enrichedArtists = await getEnrichedArtistsWithProducts(liveProducts);

  // Group live products dynamically into SSOT shelves (Auto-Hides 0-product shelves)
  const shelves = groupProductsIntoShelves(liveProducts);

  return (
    <div className="relative w-full bg-[#FFFFFF] text-[#18181B] overflow-hidden pt-28 sm:pt-36">
      {shelves.map((shelf, index) => (
        <div key={shelf.id}>
          <EtsyHorizontalShelf
            id={shelf.id}
            title={shelf.title}
            subtitle={shelf.subtitle}
            items={shelf.items}
            viewAllHref={shelf.viewAllHref}
          />
          {/* Golden Ratio: Insert Editorial Split Banner right after the 1st shelf */}
          {index === 0 && <EtsyEditorialSplitBanner />}
        </div>
      ))}

      {/* If shelves is empty, render banner as fallback */}
      {shelves.length === 0 && <EtsyEditorialSplitBanner />}

      {/* Partner Studios Showcase */}
      <AtelierSpotlight artists={enrichedArtists.map((a) => a.profile)} />
    </div>
  );
}
