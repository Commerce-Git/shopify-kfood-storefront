import Hero from "./components/Hero";
import ProductShowcase from "./components/ProductShowcase";
import WhatsInside from "./components/WhatsInside";
import TrustBadges from "./components/TrustBadges";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import StickyBuyBar from "./components/StickyBuyBar";
import { getAllProducts } from "@/lib/shopify/api";

export default async function Home() {
  const products = await getAllProducts();
  // Use the first product as the "featured" product
  const featuredProduct = products[0] || null;

  return (
    <>
      <Hero />
      <ProductShowcase product={featuredProduct} />
      <WhatsInside />
      <TrustBadges />
      <Reviews />
      <FAQ />
      <StickyBuyBar product={featuredProduct} />
    </>
  );
}
