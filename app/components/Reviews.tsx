"use client";

import { useRef, useState, useEffect } from "react";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string;
  photo_urls: string[];
  submitted_at: string;
}

// 실제 리뷰가 3개 미만일 때 표시할 MOCK 데이터 (Verified Purchase 배지 없음)
const MOCK_REVIEWS: Review[] = [
  {
    id: "mock-1",
    customer_name: "Sarah M.",
    rating: 5,
    title: "Best gift ever!",
    body: "OMG this box was AMAZING! My friends and I had a K-Drama marathon and these snacks made it 100x better. The honey butter chips are now my obsession 🍯",
    photo_urls: [],
    submitted_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "mock-2",
    customer_name: "Jake K.",
    rating: 5,
    title: "My girlfriend screamed!",
    body: "Got this as a gift for my girlfriend who's obsessed with K-Pop. She literally screamed when she opened it. Already ordering another one!",
    photo_urls: [],
    submitted_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "mock-3",
    customer_name: "Emily R.",
    rating: 5,
    title: "Incredible variety",
    body: "The variety is incredible! Some sweet, some spicy, some savory — every snack was a new adventure. The little flavor guide was such a nice touch 🥰",
    photo_urls: [],
    submitted_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#FF1E56" : "none"}
          stroke={star <= rating ? "#FF1E56" : "#E5E5E5"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 7) return days <= 1 ? "1 day ago" : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

export default function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [averageRating, setAverageRating] = useState(4.9);
  const [totalCount, setTotalCount] = useState(MOCK_REVIEWS.length);
  const [hasRealReviews, setHasRealReviews] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/review");
        if (!res.ok) return;
        const data = await res.json();

        if (data.reviews && data.reviews.length >= 3) {
          // 실제 리뷰가 3개 이상이면 MOCK 교체
          setReviews(data.reviews);
          setAverageRating(data.averageRating);
          setTotalCount(data.totalCount);
          setHasRealReviews(true);
        }
        // 3개 미만이면 MOCK 유지
      } catch {
        // 에러 시 MOCK 유지
      }
    }

    fetchReviews();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 360;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="section bg-surface-dim overflow-hidden" id="reviews-section">
      <div className="section-inner">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
              Reviews
            </span>
            <h2 className="heading-lg text-dark">
              Loved by{" "}
              <span className="gradient-text">Snack Fans</span>
            </h2>
          </div>

          {/* Navigation Arrows (desktop) */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              aria-label="Previous reviews"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              aria-label="Next reviews"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 snap-start"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {review.customer_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-dark">
                      {review.customer_name}
                    </p>
                    {hasRealReviews && !review.id.startsWith("mock") && (
                      <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating + Date */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={review.rating} />
                <span className="text-xs text-text-muted">
                  {timeAgo(review.submitted_at)}
                </span>
              </div>

              {/* Title */}
              {review.title && (
                <p className="text-sm font-semibold text-dark mb-1">
                  {review.title}
                </p>
              )}

              {/* Text */}
              <p className="text-sm text-text leading-relaxed">
                {review.body}
              </p>

              {/* Photos */}
              {review.photo_urls.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.photo_urls.map((url, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Review photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Average Rating */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow-sm">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm font-medium text-dark">
              {averageRating} out of 5
            </span>
            <span className="text-xs text-text-muted">
              • Based on {totalCount} reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
