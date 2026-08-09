import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { getProductImage, getProductImageAlt, formatPrice, isProductSoldOut } from "@/lib/shopify/api";

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
    <section className="py-12 sm:py-16 px-4 bg-transparent text-white" id="featured-products">
      <div className="max-w-[1200px] mx-auto">
        {/* Product Grid — 2-Column Extra-Large Magazine Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {hasShopifyProducts
            ? [...products]
              .sort((a, b) => {
                const availA = !isProductSoldOut(a);
                const availB = !isProductSoldOut(b);
                if (availA && !availB) return -1;
                if (!availA && availB) return 1;
                return 0;
              })
              .slice(0, 12)
              .map((product) => {
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
                      <h3 className="font-bold text-white text-lg sm:text-xl md:text-2xl leading-snug line-clamp-2 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                        {product.title}
                      </h3>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#C77B4A]" style={{ fontFamily: "var(--font-heading)" }}>
                        {formatPrice(product.priceRange.minVariantPrice.amount)}
                      </span>
                    </div>
                  </Link>
                );
              })
            : FALLBACK_PRODUCTS.map((product, i) => (
              <div
                key={i}
                className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/15 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-square bg-black/20 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <h3 className="font-bold text-white text-lg sm:text-xl md:text-2xl leading-snug line-clamp-2 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                    {product.title}
                  </h3>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#C77B4A]" style={{ fontFamily: "var(--font-heading)" }}>
                    ${product.price}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
