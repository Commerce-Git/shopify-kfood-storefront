import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts, formatPrice, isProductSoldOut } from "@/lib/shopify/api";
import type { ShopifyProduct } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "Shop All — All Products Made in Korea",
  description:
    "Browse our full collection of authentic Made in Korea goods — pouches, accessories, keyrings, wallets, and more. Dispatched direct from Korea.",
};

function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice.amount;
  const isSoldOut = isProductSoldOut(product);

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group bg-white rounded-2xl overflow-hidden border border-border-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`relative aspect-square bg-surface-dim overflow-hidden ${isSoldOut ? "opacity-85" : ""}`}>
        {image && (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
        {isSoldOut && (
          <span className="absolute top-3 left-3 z-10 bg-primary text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm border border-white/10">
            Sold Out
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-dark text-sm line-clamp-2 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {product.title}
        </h3>
        <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
          {formatPrice(price)}
        </span>
      </div>
    </Link>
  );
}

export default async function CollectionsPage() {
  const rawProducts = await getAllProducts(50);
  const products = [...rawProducts].sort((a, b) => {
    const availA = !isProductSoldOut(a);
    const availB = !isProductSoldOut(b);
    if (availA && !availB) return -1;
    if (!availA && availB) return 1;
    return 0;
  });

  return (
    <div className="pt-28 sm:pt-36 pb-24 min-h-screen bg-[#FBF9F5]">
      {/* Pure Product Grid with Quiet Luxury Micro-Header */}
      <section className="px-4 pt-4 sm:pt-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Micro-Header Bar (Quiet Luxury) */}
          <div className="flex items-center justify-between border-b border-[#E8DFC8]/60 pb-3 mb-6 sm:mb-8">
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <h1
                className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Shop All
              </h1>
              <span className="text-[11px] sm:text-xs text-text-muted font-medium tracking-wide">
                — All Products Made in Korea
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-text-muted font-medium tracking-wider whitespace-nowrap">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? "Piece" : "Pieces"}`
                : "Coming Soon"}
            </span>
          </div>

          {/* Product Grid or Luxury Empty State */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-[#E8DFC8]/60 p-8 max-w-lg mx-auto shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-4 text-[#C77B4A]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2
                className="text-lg sm:text-xl font-bold text-[#18181B] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Curating Heritage Pieces from Korea
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-6">
                Our authentic Korean collections are currently being prepared by verified independent studios and local workshops across Korea.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/artists"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#C77B4A] text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Explore Korean Studios ›
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-[#D4D4D8] hover:border-[#18181B] text-[#18181B] text-xs font-semibold transition-colors bg-white shadow-2xs"
                >
                  Return Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
