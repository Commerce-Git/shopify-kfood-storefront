import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionByHandle, getAllProducts, isProductSoldOut } from "@/lib/shopify/api";
import {
  resolveCollectionHandle,
  getCollectionConfig,
  isSuperCategory,
  getSuperCategory,
  MASTER_COLLECTIONS,
} from "@/lib/config/collections";
import CategoryWaitlistCard from "@/app/components/CategoryWaitlistCard";
import ProductCard from "@/app/components/ProductCard";

export const revalidate = 60; // ISR: 60s Edge SWR Cache

export function generateStaticParams() {
  const collectionHandles = MASTER_COLLECTIONS.map((c) => ({ handle: c.handle }));
  const superCategories = [{ handle: "wear" }, { handle: "living" }, { handle: "ritual" }];
  return [...collectionHandles, ...superCategories];
}

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const targetHandle = resolveCollectionHandle(decodedHandle);

  // 1. Super-Category Hub Check
  if (isSuperCategory(targetHandle)) {
    const superCat = getSuperCategory(targetHandle);
    if (superCat) {
      return {
        title: `${superCat.title} — Blank Seoul`,
        description: `${superCat.subtitle}. 100% Made in Korea, direct dispatch.`,
      };
    }
  }

  // 2. Individual Smart Collection Check
  const collection = await getCollectionByHandle(targetHandle);
  const config = getCollectionConfig(targetHandle);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    title: `${collection.title} — Blank Seoul`,
    description:
      config?.shelfSubtitle ||
      `Browse the ${collection.title} collection from Blank Seoul. Made in Korea.`,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const targetHandle = resolveCollectionHandle(decodedHandle);

  // =========================================================================
  // Case A: Super-Category Parent Hub (e.g. /collections/wear-adornment)
  // =========================================================================
  if (isSuperCategory(targetHandle)) {
    const superCat = getSuperCategory(targetHandle);
    if (!superCat) notFound();

    const allLive = await getAllProducts(50);
    const childConfigs = superCat.categoryHandles
      .map((h) => MASTER_COLLECTIONS.find((c) => c.handle === h))
      .filter(Boolean);

    const matchedProducts = allLive.filter((p) => {
      const pType = (p.productType || "").toLowerCase().trim();
      const pTitle = (p.title || "").toLowerCase();

      return childConfigs.some((config) => {
        const matchesType = config!.productTypeConditions.some(
          (tc) => pType === tc.toLowerCase() || pType.startsWith(tc.toLowerCase())
        );
        if (matchesType) return true;
        if (!pType || pType === "default" || pType === "general") {
          return config!.keywords.some((kw) => pTitle.includes(kw));
        }
        return false;
      });
    });

    const sortedProducts = [...matchedProducts].sort((a, b) => {
      const availA = !isProductSoldOut(a);
      const availB = !isProductSoldOut(b);
      if (availA && !availB) return -1;
      if (!availA && availB) return 1;
      return 0;
    });

    return (
      <div className="flex-1 pb-20 bg-[#FBF9F5]">
        <section className="px-4 pt-4 sm:pt-6">
          <div className="max-w-[1200px] mx-auto">
            {/* Hub Header with Breadcrumb (Quiet Luxury Exhibition Spacing) */}
            <div className="mb-8 sm:mb-10 pb-5 border-b border-[#E8DFC8]/60">
              <div className="flex items-center gap-2 text-xs text-[#71717A] mb-2.5 font-medium">
                <Link href="/" className="hover:text-[#18181B] transition-colors">Home</Link>
                <span>&rsaquo;</span>
                <Link href="/collections" className="hover:text-[#18181B] transition-colors">Collections</Link>
                <span>&rsaquo;</span>
                <span className="text-[#18181B] font-bold">{superCat.title}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {superCat.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#71717A] mt-1.5 max-w-2xl leading-relaxed">
                    {superCat.subtitle}
                  </p>
                </div>
                <span className="text-xs text-text-muted font-bold tracking-wide shrink-0">
                  {sortedProducts.length > 0
                    ? `${sortedProducts.length} ${sortedProducts.length === 1 ? "Piece Available" : "Pieces Available"}`
                    : "Next Drop in Production"}
                </span>
              </div>
            </div>

            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <CategoryWaitlistCard
                collectionTitle={superCat.title}
                categoryHandle={superCat.slug}
              />
            )}
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // Case B: Individual Smart Collection (e.g. /collections/jewelry-charms)
  // =========================================================================
  const collection = await getCollectionByHandle(targetHandle);
  const config = getCollectionConfig(targetHandle);
  const parentSuperCat = config?.superCategory ? getSuperCategory(config.superCategory) : undefined;

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
    <div className="flex-1 pb-20 bg-[#FBF9F5]">
      {/* Pure Product Grid with Quiet Luxury Micro-Header */}
      <section className="px-4 pt-4 sm:pt-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Micro-Header Bar (Quiet Luxury) */}
          <div className="flex items-center justify-between border-b border-[#E8DFC8]/60 pb-3 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#71717A] mb-1 font-medium flex-wrap">
                <Link href="/" className="hover:text-[#18181B] transition-colors">Home</Link>
                <span>&rsaquo;</span>
                <Link href="/collections" className="hover:text-[#18181B] transition-colors">Collections</Link>
                {parentSuperCat && (
                  <>
                    <span>&rsaquo;</span>
                    <Link
                      href={`/collections/${parentSuperCat.slug}`}
                      className="hover:text-[#18181B] transition-colors"
                    >
                      {parentSuperCat.title}
                    </Link>
                  </>
                )}
                <span>&rsaquo;</span>
                <span className="text-[#18181B] font-bold">{collection.title}</span>
              </div>
              <h1
                className="text-lg sm:text-xl font-black text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {collection.title}
              </h1>
              {config?.shelfSubtitle && (
                <p className="text-xs text-[#71717A] mt-0.5 max-w-xl">
                  {config.shelfSubtitle}
                </p>
              )}
            </div>

            <span className="text-[11px] sm:text-xs text-text-muted font-bold tracking-wider shrink-0">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? "Piece" : "Pieces"}`
                : "Next Drop"}
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <CategoryWaitlistCard
              collectionTitle={collection.title}
              categoryHandle={targetHandle}
            />
          )}
        </div>
      </section>
    </div>
  );
}
