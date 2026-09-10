import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductInteractive from "@/app/components/ProductInteractive";
import Reviews from "@/app/components/Reviews";
import { unstable_cache } from "next/cache";
import {
  getAllProducts,
  getProductByHandle,
  getProductImages,
} from "@/lib/shopify/api";

export const revalidate = 60; // ISR: 60s Edge SWR Cache

export async function generateStaticParams() {
  try {
    const products = await getAllProducts(50);
    return products.map((product) => ({
      handle: product.handle,
    }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ handle: string }>;
}

// 2026 Disk IO Protection: Cache approved reviews for 5 minutes (tag: reviews)
// Eliminates repetitive Full Table Scans and protects Disk IO budget under viral traffic
const getCachedReviews = unstable_cache(
  async () => {
    const { data: reviewData } = await supabaseAdmin
      .from("reviews")
      .select("id, customer_name, rating, title, body, photo_urls, submitted_at")
      .not("rating", "is", null)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false })
      .limit(50);
    return reviewData || [];
  },
  ["product-page-approved-reviews"],
  { revalidate: 300, tags: ["reviews"] }
);

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

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const product = await getProductByHandle(decodedHandle);

  if (!product) {
    notFound();
  }

  const images = getProductImages(product);

  // SEO & Zero-Waterfall: Fetch cached reviews (protected by 300s TTL)
  const reviews = await getCachedReviews();
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
    <div className="pt-28 sm:pt-36 min-h-screen bg-[#FBF9F5]">
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
        <ProductInteractive product={product} />
      </section>

      <Reviews initialReviews={reviews} initialAvgRating={avgRating} />
    </div>
  );
}
