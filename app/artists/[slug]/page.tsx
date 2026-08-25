import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/shopify/api";
import { getEnrichedArtistBySlug, getEnrichedArtistsWithProducts, getArtistSlug } from "@/lib/artists";
import type { ShopifyProduct } from "@/lib/shopify/types";

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getAllProducts(100);
  const artists = await getEnrichedArtistsWithProducts(products);
  return artists.map((a) => ({ slug: a.profile.slug }));
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getEnrichedArtistBySlug(slug);
  const displayName = artist.nameEn || artist.name;

  return {
    title: `${displayName} — Studio Works | Blank Seoul`,
    description: `Explore authentic Korean handcrafted works by ${displayName} dispatched direct from Seoul.`,
    openGraph: {
      title: `${displayName} — Blank Seoul`,
      description: `Explore authentic Korean handcrafted works by ${displayName} dispatched direct from Seoul.`,
      images: [artist.avatar],
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = await getEnrichedArtistBySlug(slug);

  // Fetch all live products from Shopify
  const allProducts = await getAllProducts(100);
  const allArtists = await getEnrichedArtistsWithProducts(allProducts);

  // Filter products by this artist
  const artistProducts = allProducts.filter((p: ShopifyProduct) => {
    const productSlug = getArtistSlug(p.vendor || "");
    return (
      productSlug === slug.toLowerCase() ||
      (p.vendor && p.vendor.toLowerCase().includes(artist.name.toLowerCase()))
    );
  });

  // Other ateliers to explore (excluding current)
  const otherAteliers = allArtists
    .filter((a) => a.profile.slug !== artist.slug)
    .map((a) => a.profile);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#18181B] pt-28 sm:pt-36 pb-20">
      {/* 1. Breadcrumb */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-3 text-xs text-[#6B7280]">
        <nav className="flex items-center gap-2">
          <Link href="/" className="hover:text-[#18181B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/artists" className="hover:text-[#18181B] transition-colors">
            Ateliers
          </Link>
          <span>/</span>
          <span className="text-[#18181B] font-bold">{artist.nameEn || artist.name}</span>
        </nav>
      </div>

      {/* 2. Ultra-Clean Centered Creator Hero */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mt-4 mb-12 text-center">
        <div className="flex flex-col items-center">
          {/* Circular Studio Avatar */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-[#E8DFC8] p-1 bg-white shadow-md">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF8F5]">
              <Image
                src={artist.avatar || "/assets/blank_seoul_symbol.png"}
                alt={artist.nameEn || artist.name}
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Artist Studio Name (English Only) */}
          <h1
            className="text-2xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight mt-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {artist.nameEn || artist.name}
          </h1>

          {/* Works Count Badge */}
          <div className="mt-3">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-[#C25E38] bg-white border border-[#E8DFC8] shadow-2xs">
              {artistProducts.length} {artistProducts.length === 1 ? "Studio Work" : "Studio Works"} Available
            </span>
          </div>
        </div>
      </section>

      {/* 3. Studio Collection / Products Grid */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E8DFC8]">
          <h2
            className="text-lg sm:text-xl font-extrabold text-[#18181B] tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Studio Works
          </h2>
          <span className="text-xs font-semibold text-[#6B7280]">
            {artistProducts.length} {artistProducts.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {artistProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DFC8]">
            <p className="text-base font-bold text-[#18181B]">
              New creations are currently in progress at the studio.
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Please check back soon or explore our other verified Seoul ateliers.
            </p>
            <Link
              href="/collections"
              className="inline-block mt-4 px-6 py-2.5 rounded-full bg-[#18181B] text-white font-bold text-xs hover:bg-[#C25E38] transition-colors"
            >
              Explore All Collections →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {artistProducts.map((product: ShopifyProduct) => {
              const image = product.images?.edges?.[0]?.node?.url || "/assets/blank_seoul_symbol.png";
              const price = product.variants?.edges?.[0]?.node?.price?.amount;
              const compareAtPrice = product.variants?.edges?.[0]?.node?.compareAtPrice?.amount;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col cursor-pointer"
                >
                  {/* Square Product Image */}
                  <Link
                    href={`/product/${product.handle}`}
                    className="relative block aspect-square rounded-2xl overflow-hidden bg-[#F5F0E6] border border-[#E8DFC8] shadow-2xs group-hover:shadow-md transition-all"
                  >
                    <Image
                      src={image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-106"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/6 transition-colors" />
                  </Link>

                  {/* Clean Product Info */}
                  <div className="mt-2.5 px-0.5">
                    <h3
                      className="text-xs sm:text-sm font-medium text-[#18181B] leading-tight line-clamp-1 group-hover:underline"
                      title={product.title}
                    >
                      <Link href={`/product/${product.handle}`}>
                        {product.title}
                      </Link>
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className={`text-xs sm:text-sm font-bold ${compareAtPrice ? "text-[#15803D]" : "text-[#18181B]"}`}>
                        USD {price ? Number(price).toFixed(2) : "0.00"}
                      </span>
                      {compareAtPrice && Number(compareAtPrice) > Number(price) && (
                        <span className="text-[10px] text-[#9CA3AF] line-through font-normal">
                          USD {Number(compareAtPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Explore Other Verified Ateliers */}
      {otherAteliers.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-[#E8DFC8]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-base sm:text-lg font-bold text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Explore Other Ateliers
              </h2>
            </div>
            <Link
              href="/artists"
              className="text-xs font-bold text-[#C25E38] hover:underline"
            >
              All Ateliers Directory →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {otherAteliers.map((other) => (
              <Link
                key={other.slug}
                href={`/artists/${other.slug}`}
                className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-[#E8DFC8]"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#E8DFC8] group-hover:border-[#C25E38] p-1 bg-white shadow-2xs transition-all">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF8F5]">
                    <Image
                      src={other.avatar || "/assets/blank_seoul_symbol.png"}
                      alt={other.name}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="mt-2 w-full">
                  <h4 className="text-xs font-bold text-[#18181B] group-hover:text-[#C25E38] transition-colors truncate">
                    {other.nameEn || other.name}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
