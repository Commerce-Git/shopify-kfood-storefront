import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { getProductImage, getProductImageAlt, formatPrice, isProductSoldOut } from "@/lib/shopify/api";

interface FeaturedProductsProps {
  products?: ShopifyProduct[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const sortedProducts = [...products]
    .sort((a, b) => {
      const availA = !isProductSoldOut(a);
      const availB = !isProductSoldOut(b);
      if (availA && !availB) return -1;
      if (!availA && availB) return 1;
      return 0;
    })
    .slice(0, 12);

  return (
    <section className="py-12 sm:py-16 px-4 bg-transparent text-white" id="featured-products">
      <div className="max-w-[1200px] mx-auto">
        {/* Product Grid — 2-Column Extra-Large Magazine Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {sortedProducts.map((product) => {
            const isSoldOut = isProductSoldOut(product);
            return (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/15 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-square bg-black/20 overflow-hidden">
                  <Image
                    src={getProductImage(product)}
                    alt={getProductImageAlt(product)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {isSoldOut && (
                    <span className="absolute top-5 left-5 z-10 bg-primary/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md border border-white/10">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <h3
                    className="font-bold text-white text-lg sm:text-xl md:text-2xl leading-snug line-clamp-2 mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {product.title}
                  </h3>
                  <span
                    className="text-xl sm:text-2xl font-extrabold text-[#C77B4A]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {formatPrice(product.priceRange.minVariantPrice.amount)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
