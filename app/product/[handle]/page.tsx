import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductGallery from "@/app/components/ProductGallery";
import AddToCartSection from "@/app/components/AddToCartSection";
import Reviews from "@/app/components/Reviews";
import {
  getProductByHandle,
  getProductImages,
  getProductPricing,
  getFirstVariantId,
  formatPrice,
} from "@/lib/shopify/api";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const product = await getProductByHandle(decodedHandle);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.title,
    description: product.description.slice(0, 160),
  };
}

const HIGHLIGHTS = [
  "Handcrafted by independent Korean artisan",
  "100% Made to order in Korea",
  "Ships direct from Seoul via K-Packet (7-14 days)",
  "Unique — no two pieces are exactly alike",
  "Beautiful gift packaging included",
  "Tracking number provided",
];

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const product = await getProductByHandle(decodedHandle);

  if (!product) {
    notFound();
  }

  const images = getProductImages(product);
  const pricing = getProductPricing(product);
  const variantId = getFirstVariantId(product);
  const priceNum = parseFloat(pricing.price);
  const compareNum = pricing.compareAtPrice
    ? parseFloat(pricing.compareAtPrice)
    : null;
  const discount =
    compareNum && compareNum > priceNum
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : null;

  // SEO: 리뷰 구조화 데이터 (Google Rich Snippets)
  const { data: reviewData } = await supabaseAdmin
    .from("reviews")
    .select("customer_name, rating, title, body, submitted_at")
    .not("rating", "is", null)
    .eq("status", "approved")
    .order("submitted_at", { ascending: false })
    .limit(10);

  const reviews = reviewData || [];
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length) *
            10
        ) / 10
      : null;

  const jsonLd = avgRating
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description.slice(0, 300),
        image: images[0]?.url,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: String(avgRating),
          reviewCount: String(reviews.length),
        },
        review: reviews.slice(0, 5).map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.customer_name },
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(r.rating),
          },
          reviewBody: r.body || r.title || "",
          datePublished: r.submitted_at,
        })),
      }
    : null;

  return (
    <div className="pt-20">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-dark font-medium">{product.title}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <ProductGallery images={images} title={product.title} />

          {/* Product Info */}
          <div className="flex flex-col gap-6 lg:pt-4">
            {product.availableForSale && (
              <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 bg-slate-500 rounded-full" />
                {product.tags.includes("limited") ? "Low Stock" : "Made to Order"}
              </div>
            )}

            <h1 className="heading-lg text-dark">{product.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-extrabold text-dark"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {formatPrice(pricing.price, pricing.currency)}
              </span>
              {compareNum && compareNum > priceNum && (
                <span className="text-lg text-text-muted line-through">
                  {formatPrice(pricing.compareAtPrice!, pricing.currency)}
                </span>
              )}
              {discount && (
                <span className="text-sm font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div 
              className="text-text-muted leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />

            {/* Features */}
            <div className="space-y-2.5">
              {HIGHLIGHTS.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-text"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-success flex-shrink-0"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="currentColor"
                      opacity="0.15"
                    />
                    <path
                      d="M8 12l2.5 2.5L16 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            {/* Buy */}
            {variantId && (
              <AddToCartSection
                variantId={variantId}
                price={pricing.price}
                currency={pricing.currency}
                productTitle={product.title}
                productHandle={product.handle}
                availableForSale={product.availableForSale}
                productTags={product.tags}
              />
            )}

            {/* Shipping Info */}
            <div className="flex items-start gap-3 p-4 bg-surface-dim rounded-xl text-sm">
              <span className="text-xl">✈️</span>
              <div>
                <p className="font-semibold text-dark">
                  Ships from Seoul, Korea
                </p>
                <p className="text-text-muted">
                  Estimated delivery: 7-14 business days via K-Packet.
                  Tracking number provided.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Reviews />
    </div>
  );
}
