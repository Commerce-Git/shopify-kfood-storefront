import Hero from "./components/Hero";
import EpiphanyStory from "./components/EpiphanyStory";
import ProductShowcase from "./components/ProductShowcase";
import WhatsInside from "./components/WhatsInside";
import TrustBadges from "./components/TrustBadges";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import StickyBuyBar from "./components/StickyBuyBar";
import { getAllProducts } from "@/lib/shopify/api";

export default async function Home() {
  const products = await getAllProducts();
  const featuredProduct = products[0] || null;

  return (
    <>
      {/* Phase 1: Hook — 시선을 사로잡는다 */}
      <Hero />

      {/* Phase 2: Story — 공감과 욕망을 만든다 */}
      <EpiphanyStory />

      {/* Phase 3: Offer — 거절할 수 없는 제안을 한다 */}
      <ProductShowcase product={featuredProduct} />
      <WhatsInside />

      {/* Phase 4: Trust & Social Proof — 신뢰를 강화한다 */}
      <TrustBadges />
      <Reviews />

      {/* Phase 5: Objection Handling — 마지막 저항을 없앤다 */}
      <FAQ />

      {/* 항시 전환 유도 */}
      <StickyBuyBar product={featuredProduct} />
    </>
  );
}
