import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionByHandle, formatPrice } from "@/lib/shopify/api";
import type { ShopifyProduct } from "@/lib/shopify/types";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const collection = await getCollectionByHandle(decodedHandle);

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
  const collection = await getCollectionByHandle(decodedHandle);

  if (!collection) {
    notFound();
  }

  const products = collection.products.edges.map(e => e.node);

  return (
    <div className="pt-24 pb-20">
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
          <div className="mb-6 text-sm text-text-muted font-medium">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-text-muted">
              No products found in this collection.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
