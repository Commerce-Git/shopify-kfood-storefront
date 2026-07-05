import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { getProductImage, getProductImageAlt, formatPrice } from "@/lib/shopify/api";

// Fallback products from scraped Idus data (used when Shopify has no products)
const FALLBACK_PRODUCTS = [
  {
    title: "Traditional Folding Fan — Night Plum Blossom",
    price: "29.00",
    image: "/assets/idus-products/456ac39c515a4d4cae17377a49172baa_512.jpg",
    handle: "#",
  },
  {
    title: "Korean Traditional Keyring Charm",
    price: "15.00",
    image: "/assets/idus-products/0520a9fbd8ba4fa0bb34437cae0fe442_512.jpg",
    handle: "#",
  },
  {
    title: "Hangul Scrunchie — Joseon Hip Edition",
    price: "19.00",
    image: "/assets/idus-products/02860993e6b34e69a1758066e39b9abd_512.jpg",
    handle: "#",
  },
  {
    title: "Traditional Pattern Drink Bag",
    price: "22.00",
    image: "/assets/idus-products/cd2619e7f712472d82816db297940c32_512.jpg",
    handle: "#",
  },
  {
    title: "Bokjumoni Lucky Pouch",
    price: "32.00",
    image: "/assets/idus-products/f942852c8316492482b7fafc0a949ff6_512.jpg",
    handle: "#",
  },
  {
    title: "Traditional Knot Choker Necklace",
    price: "27.00",
    image: "/assets/idus-products/1c313831722948b594d6f897d458109f_512.jpg",
    handle: "#",
  },
];

interface FeaturedProductsProps {
  products?: ShopifyProduct[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const hasShopifyProducts = products && products.length > 0;

  if (!hasShopifyProducts) {
    console.warn("⚠️ [FeaturedProducts] No products fetched from Shopify. Falling back to Idus hardcoded data. Make sure collections/products are published to the Headless Sales Channel.");
  }

  return (
    <section className="py-24 px-4 bg-surface-dim" id="featured-products">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
            Curated Selection
          </span>
          <h2 className="heading-lg text-dark">
            Most Loved <span className="gradient-text">Artisan Pieces</span>
          </h2>
          <p className="text-text-muted mt-4 max-w-xl mx-auto">
            Handpicked from Korea&apos;s finest independent artisans. Each piece is made with care and ships direct from Seoul.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {hasShopifyProducts
            ? products.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group bg-white rounded-2xl overflow-hidden border border-border-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-square bg-surface-dim overflow-hidden">
                  <Image
                    src={getProductImage(product)}
                    alt={getProductImageAlt(product)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-dark text-sm line-clamp-2 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {product.title}
                  </h3>
                  <span className="text-base sm:text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                    {formatPrice(product.priceRange.minVariantPrice.amount)}
                  </span>
                </div>
              </Link>
            ))
            : FALLBACK_PRODUCTS.map((product, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl overflow-hidden border border-border-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-square bg-surface-dim overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-dark text-sm line-clamp-2 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {product.title}
                  </h3>
                  <span className="text-base sm:text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                    ${product.price}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link href="/collections" className="btn-secondary">
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
