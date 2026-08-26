import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionByHandle, formatPrice, isProductSoldOut } from "@/lib/shopify/api";
import type { ShopifyProduct } from "@/lib/shopify/types";

const HANDLE_ALIASES: Record<string, string> = {
  "bags-wallets": "bags-purses",
  "home-goods": "home-living",
  "bags": "bags-purses",
  "home": "home-living",
};

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const targetHandle = HANDLE_ALIASES[decodedHandle] || decodedHandle;
  const collection = await getCollectionByHandle(targetHandle);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    title: `${collection.title} — Blank Seoul`,
    description: collection.description || `Browse the ${collection.title} collection from Blank Seoul.`,
  };
}

function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice.amount;
  const isSoldOut = isProductSoldOut(product);

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group bg-white rounded-2xl overflow-hidden border border-border-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square bg-surface-dim overflow-hidden">
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
          {formatPrice(price, "USD")}
        </span>
      </div>
    </Link>
  );
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const targetHandle = HANDLE_ALIASES[decodedHandle] || decodedHandle;
  const collection = await getCollectionByHandle(targetHandle);

  if (!collection) {
    notFound();
  }

  const rawProducts = collection.products?.edges.map((e) => e.node) || [];
  const products = [...rawProducts].sort((a, b) => {
    const availA = !isProductSoldOut(a);
    const availB = !isProductSoldOut(b);
    if (availA && !availB) return -1;
    if (!availA && availB) return 1;
    return 0;
  });

  return (
    <div className="pt-28 sm:pt-36 pb-20 min-h-screen bg-[#FBF9F5]">
      {/* Header */}
      <section className="py-16 px-4 bg-surface-dim border-b border-border-light mb-12">
        <div className="max-w-[1200px] mx-auto text-center animate-fade-in-up">
          <h1 className="heading-xl text-dark mb-4">
            {collection.title}
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            {collection.description || `Discover our beautifully curated ${collection.title} collection, handcrafted by Korean artisans.`}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4">
        <div className="max-w-[1200px] mx-auto">
          {products.length > 0 ? (
            <>
              <div className="mb-6 text-sm text-text-muted font-medium">
                {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFC8]/60 p-8 max-w-lg mx-auto shadow-2xs">
              <span className="text-4xl mb-3 block">🏛️</span>
              <h2 className="text-lg font-bold text-[#18181B] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                New Artisan Curations Arriving Soon
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mb-6">
                Our master ateliers in Seoul are crafting new pieces for this collection. Explore other active works in the meantime.
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#18181B] hover:bg-[#C25E38] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Explore All Collections ›
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
