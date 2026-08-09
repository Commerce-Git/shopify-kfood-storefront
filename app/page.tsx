import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import ArtisanSpotlight from "./components/ArtisanSpotlight";
import Reviews from "./components/Reviews";
import NewsletterCTA from "./components/NewsletterCTA";
import { getAllProducts } from "@/lib/shopify/api";

export default async function Home() {
  // Fetch all 8 signature products for the exhibition gallery
  const allProducts = await getAllProducts(50);

  return (
    <div className="relative w-full bg-gradient-to-b from-[#0F1A15] via-[#1A2E25] via-[#12221B] to-[#0A140F] text-white overflow-hidden">
      {/* 100% Unified Monolithic Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Unified subtle glow accents */}
      <div className="absolute top-1/6 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. Hero — Full Hero Product Carousel Slider */}
      <Hero products={allProducts} />

      {/* 2. Section 1 — ArtisanSpotlight: Brand Strengths & Core Values */}
      <ArtisanSpotlight />

      {/* 3. Section 2 — FeaturedProducts: All 8 Masterpieces Showcase Grid */}
      <FeaturedProducts products={allProducts} />

      {/* 4. Section 3 — Social Proof: Reviews */}
      <Reviews />

      {/* 6. Section 5 — Lead Capture: NewsletterCTA */}
      <NewsletterCTA />
    </div>
  );
}
