import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts, formatPrice, isProductSoldOut } from "@/lib/shopify/api";
import type { ShopifyProduct } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "Shop All — Korean Artisan Goods",
  description:
    "Browse our full collection of handcrafted Korean artisan goods — pouches, accessories, keyrings, wallets, and more. Direct from Seoul.",
};

// Fallback products when Shopify has no products
const FALLBACK_PRODUCTS = [
  { title: "Traditional Folding Fan — Night Plum Blossom", price: "29.00", image: "/assets/idus-products/456ac39c515a4d4cae17377a49172baa_512.jpg" },
  { title: "Korean Traditional Keyring Charm", price: "15.00", image: "/assets/idus-products/0520a9fbd8ba4fa0bb34437cae0fe442_512.jpg" },
  { title: "Poinsettia Wooden Hair Pin", price: "27.00", image: "/assets/idus-products/36b09a3e47e34f189c99ccc10f5074fe_512.jpg" },
  { title: "Hangul Scrunchie — Joseon Hip", price: "19.00", image: "/assets/idus-products/02860993e6b34e69a1758066e39b9abd_512.jpg" },
  { title: "Traditional Drink Bag", price: "22.00", image: "/assets/idus-products/cd2619e7f712472d82816db297940c32_512.jpg" },
  { title: "Half Moon Pouch — Traditional Series", price: "38.00", image: "/assets/idus-products/106064669200456189b0d03b103b1fda_512.jpg" },
  { title: "Traditional Pattern Card Wallet", price: "28.00", image: "/assets/idus-products/658598b88a544bc495616b9220d0e46f_512.jpg" },
  { title: "Lucky Fish Door Bell", price: "42.00", image: "/assets/idus-products/eafc5e7419f544bb945e8ab3baca5bee_512.jpg" },
  { title: "Ebony Wood Flower Hair Pin", price: "32.00", image: "/assets/idus-products/3507c206e1be4b7d9ae44c82f458de89_512.jpg" },
  { title: "Traditional Bandana Headband", price: "34.00", image: "/assets/idus-products/ab7ac6d488d44d3f98ace048925f8e3b_512.jpg" },
  { title: "Hanbok Scrunchie Set 1+1", price: "25.00", image: "/assets/idus-products/064c91003ab341cc9a19fc042a603b77_512.jpg" },
  { title: "Korean Knot Choker Necklace", price: "27.00", image: "/assets/idus-products/1c313831722948b594d6f897d458109f_512.jpg" },
  { title: "Bokjumoni Lucky Pouch", price: "32.00", image: "/assets/idus-products/f942852c8316492482b7fafc0a949ff6_512.jpg" },
  { title: "Fabric Mini 3-Fold Card Wallet", price: "20.00", image: "/assets/idus-products/e9d9c60475444249b6afa11e8f782ec1_512.jpg" },
  { title: "Bokjumoni One Handle Bag", price: "44.00", image: "/assets/idus-products/047878ecd15945aeb04dc042e57049c4_512.jpg" },
  { title: "Persimmon Drawstring Pouch", price: "35.00", image: "/assets/idus-products/22e2634242274de7bdd9141e1bb602fc_512.jpg" },
  { title: "Joseon Traditional Coaster Set", price: "9.00", image: "/assets/idus-products/b901140d639c45b4b422561fdd4fc91b_512.jpg" },
  { title: "Blue & White Porcelain Coaster", price: "8.00", image: "/assets/idus-products/f2074f1d25324ff7b9974838c03c640e_512.jpg" },
  { title: "Traditional Knot Keyring — Dongsimgyeol", price: "20.00", image: "/assets/idus-products/6a74a43c1ccb4d218238e9da1d0dd26a_512.jpg" },
];

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

function FallbackCard({ product }: { product: (typeof FALLBACK_PRODUCTS)[number] }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-border-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-square bg-surface-dim overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-dark text-sm line-clamp-2 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {product.title}
        </h3>
        <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
          ${product.price}
        </span>
      </div>
    </div>
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
  const hasShopifyProducts = products.length > 0;

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-[#FBF9F5]">
      {/* Header */}
      <section className="section bg-gradient-to-b from-surface-dim to-white">
        <div className="section-inner text-center">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
            Shop All
          </span>
          <h1 className="heading-lg text-dark mb-4">
            Korean Artisan <span className="gradient-text">Collection</span>
          </h1>
          <p className="text-text-muted max-w-lg mx-auto">
            Every piece is handcrafted by independent Korean artisans and shipped directly from Seoul. Browse our full collection below.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {hasShopifyProducts
              ? products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
              : FALLBACK_PRODUCTS.map((product, i) => (
                <FallbackCard key={i} product={product} />
              ))}
          </div>

          {!hasShopifyProducts && (
            <div className="text-center mt-12 p-6 bg-surface-dim rounded-2xl">
              <p className="text-text-muted text-sm">
                🚧 Products are being added. Check back soon for the full collection!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
