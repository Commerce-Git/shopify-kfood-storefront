"use client";

import { useRef } from "react";

interface Review {
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  date: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    name: "Sarah M.",
    location: "Los Angeles, CA",
    rating: 5,
    text: "OMG this box was AMAZING! My friends and I had a K-Drama marathon and these snacks made it 100x better. The honey butter chips are now my obsession 🍯",
    avatar: "SM",
    date: "2 weeks ago",
  },
  {
    name: "Jake K.",
    location: "New York, NY",
    rating: 5,
    text: "Got this as a gift for my girlfriend who's obsessed with K-Pop. She literally screamed when she opened it. Best gift ever. Already ordering another one!",
    avatar: "JK",
    date: "1 month ago",
  },
  {
    name: "Emily R.",
    location: "Chicago, IL",
    rating: 5,
    text: "The variety is incredible! Some sweet, some spicy, some savory — every snack was a new adventure. The little flavor guide was such a nice touch 🥰",
    avatar: "ER",
    date: "3 weeks ago",
  },
  {
    name: "David L.",
    location: "Austin, TX",
    rating: 4,
    text: "Really solid box. Loved discovering snacks I'd never heard of before. The tteokbokki chips were spicy but SO good. Would love a bigger box option!",
    avatar: "DL",
    date: "1 month ago",
  },
  {
    name: "Mina P.",
    location: "Seattle, WA",
    rating: 5,
    text: "As a Korean-American, I was skeptical but these are actually legit! Not the knock-off versions I see in some Asian grocery stores. Real deal from Korea 🇰🇷",
    avatar: "MP",
    date: "2 months ago",
  },
  {
    name: "Chris T.",
    location: "Miami, FL",
    rating: 5,
    text: "Shipping was surprisingly fast! Everything arrived in perfect condition. Already planning a K-snack tasting party with these. 10/10 would recommend!",
    avatar: "CT",
    date: "1 week ago",
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

export default function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null);

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
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {MOCK_REVIEWS.map((review) => (
            <div
              key={review.name}
              className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 snap-start"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">
                    {review.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {review.location}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={review.rating} />
                <span className="text-xs text-text-muted">{review.date}</span>
              </div>

              {/* Text */}
              <p className="text-sm text-text leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* Average Rating */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow-sm">
            <StarRating rating={5} />
            <span className="text-sm font-medium text-dark">
              4.9 out of 5
            </span>
            <span className="text-xs text-text-muted">
              • Based on {MOCK_REVIEWS.length} reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
