import Image from "next/image";
import Link from "next/link";
import { formatPrice, isProductSoldOut } from "@/lib/shopify/api";
import type { ShopifyProduct } from "@/lib/shopify/types";
import WishlistHeartOverlay from "@/app/components/WishlistHeartOverlay";

interface ProductCardProps {
  product: ShopifyProduct;
  priority?: boolean;
  currencyCode?: string;
}

/**
 * 2026 Canonical Product Card Component (React Server Component)
 * - Zero-JS SSR: Card container and metadata are rendered server-side with zero hydration cost.
 * - Islands Architecture: Houses isolated client island <WishlistHeartOverlay /> for 1-click wishlist toggle.
 * - Core Web Vitals: Supports priority={true} for top-of-page LCP image preloading.
 * - WCAG 2.2 Accessibility: Image link is tabIndex={-1} aria-hidden="true" to eliminate duplicate link reading.
 * - Quiet Luxury Visuals: Smooth secondary lifestyle image cross-fade when available.
 */
export default function ProductCard({
  product,
  priority = false,
  currencyCode = "USD",
}: ProductCardProps) {
  const primaryImage = product.images?.edges?.[0]?.node;
  const secondaryImage = product.images?.edges?.[1]?.node;
  const price = product.priceRange.minVariantPrice.amount;
  const isSoldOut = isProductSoldOut(product);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-border-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Aspect Square Image Container with Sibling Overlay */}
        <div
          className={`relative aspect-square bg-surface-dim overflow-hidden ${
            isSoldOut ? "opacity-85" : ""
          }`}
        >
          <Link
            href={`/product/${product.handle}`}
            className="block w-full h-full"
            tabIndex={-1}
            aria-hidden="true"
          >
            {primaryImage && (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.title}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                  secondaryImage ? "group-hover:opacity-0" : ""
                }`}
              />
            )}

            {/* Optional 2nd Lifestyle / Detail Image Crossfade */}
            {secondaryImage && (
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.altText || product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              />
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/4 transition-colors" />
          </Link>

          {/* Client Island: Interactive Wishlist Heart Button */}
          <WishlistHeartOverlay
            productId={product.id}
            productHandle={product.handle}
          />

          {/* Sold Out Badge */}
          {isSoldOut && (
            <span className="absolute top-3 left-3 z-10 bg-primary text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm border border-white/10">
              Sold Out
            </span>
          )}
        </div>

        {/* Product Meta Section */}
        <div className="p-4">
          <h3
            className="font-semibold text-dark text-sm line-clamp-2 mb-2 group-hover:text-[#C25E38] transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Link href={`/product/${product.handle}`}>
              {product.title}
            </Link>
          </h3>
          <span
            className="text-lg font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatPrice(price, currencyCode)}
          </span>
        </div>
      </div>
    </div>
  );
}
