import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import BuyButton from "@/app/components/BuyButton";
import TrustBadges from "@/app/components/TrustBadges";
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
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.title,
    description: product.description.slice(0, 160),
  };
}

const HIGHLIGHTS = [
  "10+ curated Korean items per box",
  "Mix of sweet, savory & spicy flavors",
  "Includes trending K-Drama snacks",
  "English flavor guide included",
  "Ships from Seoul via EMS (5-10 days)",
  "FDA compliant — properly declared",
];

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

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
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-dim">
              <Image
                src={images[0]?.url || "/images/snack-box.webp"}
                alt={images[0]?.alt || product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {discount && compareNum && (
                <div className="absolute top-4 left-4 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  SAVE {formatPrice(String(compareNum - priceNum), pricing.currency)}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`
                      relative aspect-square rounded-xl overflow-hidden bg-surface-dim cursor-pointer
                      border-2 transition-all duration-200
                      ${i === 0 ? "border-primary" : "border-transparent hover:border-primary/30"}
                    `}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6 lg:pt-4">
            {product.availableForSale && (
              <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {product.tags.includes("limited") ? "Limited Edition" : "In Stock"}
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

            <p className="text-text-muted leading-relaxed">
              {product.description}
            </p>

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
              <div className="mt-2 space-y-4">
                <BuyButton
                  variantId={variantId}
                  label={`Buy Now — ${formatPrice(pricing.price, pricing.currency)}`}
                  size="lg"
                />
              </div>
            )}

            {/* Shipping Info */}
            <div className="flex items-start gap-3 p-4 bg-surface-dim rounded-xl text-sm">
              <span className="text-xl">✈️</span>
              <div>
                <p className="font-semibold text-dark">
                  Ships from Seoul, Korea
                </p>
                <p className="text-text-muted">
                  Estimated delivery: 5-10 business days via Korea Post EMS.
                  Tracking number provided.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBadges />
      <Reviews />
    </div>
  );
}
