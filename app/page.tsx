import Hero from "./components/Hero";
import WhatsInside from "./components/WhatsInside";
import TrustBadges from "./components/TrustBadges";
import FAQ from "./components/FAQ";
import StickyBuyBar from "./components/StickyBuyBar";
import { getAllProducts } from "@/lib/shopify/api";

export default async function Home() {
  const products = await getAllProducts();
  const featuredProduct = products[0] || null;

  return (
    <>
      {/* 1. Hero — 3초 안에 "과자 박스다" 인지 + CTA */}
      <Hero />

      {/* 2. What's Inside — "뭐가 들어있지?" 호기심 해소 */}
      <WhatsInside />

      {/* 3. Trust — 실제 차별점 (서울 직배송, FDA, 정품) */}
      <TrustBadges />

      {/* 4. FAQ — 구매 전 걱정 해소 */}
      <FAQ />

      {/* 항시 따라다니는 CTA */}
      <StickyBuyBar product={featuredProduct} />
    </>
  );
}
