import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import CollectionGrid from "./components/CollectionGrid";
import BrandStory from "./components/BrandStory";
import ArtisanSpotlight from "./components/ArtisanSpotlight";
import Reviews from "./components/Reviews";
import NewsletterCTA from "./components/NewsletterCTA";
import { getAllProducts } from "@/lib/shopify/api";

export default async function Home() {
  const products = await getAllProducts();

  return (
    <>
      {/* 1. Hero — Hook: 3초 안에 "한국 수공예 직배송" 인지 */}
      <Hero />

      {/* 2. Featured Products — Value Ladder 프론트엔드 */}
      <FeaturedProducts products={products} />

      {/* 3. Collection Grid — 테마별 컬렉션 진입점 */}
      <CollectionGrid />

      {/* 4. Brand Story — Curator's Note (감정적 연결) */}
      <BrandStory />

      {/* 5. Why Blank Seoul — 핵심 차별점 (Made in Korea + Direct + Made to Order) */}
      <ArtisanSpotlight />

      {/* 6. Social Proof — 실제 후기 */}
      <Reviews />

      {/* 7. Newsletter — Lead Capture */}
      <NewsletterCTA />
    </>
  );
}
