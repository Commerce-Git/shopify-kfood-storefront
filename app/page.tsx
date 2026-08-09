import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import BrandStory from "./components/BrandStory";
import ArtisanSpotlight from "./components/ArtisanSpotlight";
import Reviews from "./components/Reviews";
import NewsletterCTA from "./components/NewsletterCTA";
import { getAllProducts } from "@/lib/shopify/api";

export default async function Home() {
  // Fetch all 8 signature products for the exhibition gallery
  const allProducts = await getAllProducts(50);

  return (
    <>
      {/* 1. Hero — Hook: 3초 안에 "한국 수공예 직배송" 인지 */}
      <Hero />

      {/* 2. All 8 Heritage Editions — 단일 마스터피스 갤러리 전시 */}
      <FeaturedProducts products={allProducts} />

      {/* 3. Brand Story — Curator's Note (감정적 연결) */}
      <BrandStory />

      {/* 4. Why Blank Seoul — 핵심 차별점 (Made in Korea + Direct + Made to Order) */}
      <ArtisanSpotlight />

      {/* 5. Social Proof — 실제 후기 */}
      <Reviews />

      {/* 6. Newsletter — Lead Capture */}
      <NewsletterCTA />
    </>
  );
}
