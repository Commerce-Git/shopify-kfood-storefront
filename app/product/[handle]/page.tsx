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
          (reviews.reduce((sum: number, r: { rating: number | null }) => sum + (r.rating || 0), 0) /
            reviews.length) *
            10
        ) / 10
      : null;

  const firstVariant = product.variants.edges[0]?.node;
  const price = firstVariant?.price.amount || "0.00";
  const currency = firstVariant?.price.currencyCode || "USD";
  const isAvailable = product.availableForSale !== false;
  const materialTag = product.tags
    ?.find((t) => t.toLowerCase().startsWith("material:"))
    ?.split(":")[1]
    ?.trim();

  const canonicalUrl = `https://blankseoul.com/product/${encodeURIComponent(decodedHandle)}`;

  // 2026 Google Merchant Listings & GEO Schema: Product is always indexed regardless of review count
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.slice(0, 300),
    image: images.map((img) => img.url),
    url: canonicalUrl,
    sku: firstVariant?.id || product.id,
    brand: {
      "@type": "Brand",
      name: product.vendor || "BLANK SEOUL",
    },
    category: product.productType || "Artisanal Home & Living",
    countryOfOrigin: {
      "@type": "Country",
      name: "South Korea",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: price,
      priceCurrency: currency,
      itemCondition: "https://schema.org/NewCondition",
      availability: isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "BLANK SEOUL",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: currency,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  if (materialTag) {
    jsonLd.material = materialTag;
  }

  // Task E: Single Product JSON-LD must NOT include store-wide reviews or aggregate ratings.
  // Per Google Merchant & Schema.org guidelines, aggregateRating on a Product must only reflect
  // reviews specific to that product. Store-wide reviews are rendered in the UI with clear labelling.

  return (
    <div className="flex-1 bg-[#FBF9F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

      <Reviews
        initialReviews={reviews}
        initialAvgRating={avgRating}
        subtitle="Store Reviews"
        title="What Collectors Say About BLANK SEOUL"
      />
    </div>
  );
}
