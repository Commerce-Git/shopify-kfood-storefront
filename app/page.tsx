import Hero from "./components/Hero";
import StorySection from "./components/StorySection";
import OfferStack from "./components/OfferStack";
import TrustBadges from "./components/TrustBadges";
import CustomerReviews from "./components/CustomerReviews";
import FAQ from "./components/FAQ";
import StickyBuyBar from "./components/StickyBuyBar";
import { getAllProducts, getFirstVariantId } from "@/lib/shopify/api";

export default async function Home() {
  const products = await getAllProducts();
  const featuredProduct = products[0] || null;
  const variantId = featuredProduct ? getFirstVariantId(featuredProduct) : undefined;

  return (
    <>
      {/* 1. Hero — 3초 안에 "과자 박스다" 인지 + 바로 결제 */}
      <Hero variantId={variantId} />

      {/* 2. Story — Epiphany Bridge */}
      <StorySection />

      {/* 3. Offer Stack — 거부할 수 없는 제안 */}
      <OfferStack variantId={variantId} />

      {/* 4. Trust — 실제 차별점 (서울 직배송, FDA, 정품) */}
      <TrustBadges />

      {/* 5. Social Proof — 실제 후기 */}
      <CustomerReviews />

      {/* 6. FAQ — 구매 전 걱정 해소 */}
      <FAQ />

      {/* 항시 따라다니는 CTA */}
      <StickyBuyBar product={featuredProduct} />
    </>
  );
}
