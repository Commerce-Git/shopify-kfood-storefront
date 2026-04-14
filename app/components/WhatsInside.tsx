"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface SnackItem {
  name: string;
  description: string;
  image: string;
  tag: string;
}

const SNACK_ITEMS: SnackItem[] = [
  {
    name: "Honey Butter Chips",
    description: "The viral sensation that started the K-snack craze worldwide",
    image: "/images/snack-1.webp",
    tag: "🔥 Bestseller",
  },
  {
    name: "Tteokbokki Snack",
    description: "Spicy rice cake flavor in a crispy chip — K-Drama favorite",
    image: "/images/snack-2.webp",
    tag: "🌶️ Spicy",
  },
  {
    name: "Choco Pie",
    description: "Korea's iconic chocolate marshmallow cake, loved since 1974",
    image: "/images/snack-3.webp",
    tag: "🍫 Classic",
  },
  {
    name: "Banana Milk Candy",
    description: "The taste of Korea's favorite banana milk in candy form",
    image: "/images/snack-4.webp",
    tag: "🍌 Sweet",
  },
  {
    name: "Seaweed Snack",
    description: "Crispy roasted seaweed with sesame oil — healthy & addictive",
    image: "/images/snack-5.webp",
    tag: "🥬 Healthy",
  },
  {
    name: "Korean Ramen",
    description: "A beloved instant noodle flavor you can't find in US stores",
    image: "/images/snack-6.webp",
    tag: "🍜 Savory",
  },
];

export default function WhatsInside() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
            observer.unobserve(ref);
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="section bg-surface-dim" id="whats-inside">
      <div className="section-inner">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
            What&apos;s Inside
          </span>
          <h2 className="heading-lg text-dark mb-4">
            Every Box is a{" "}
            <span className="gradient-text">Surprise</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Each month we curate 10+ unique snacks from Korea&apos;s trendiest
            convenience stores, local bakeries, and hidden gems.
          </p>
        </div>

        {/* Snack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SNACK_ITEMS.map((item, index) => (
            <div
              key={item.name}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={`
                group relative bg-white rounded-2xl overflow-hidden shadow-sm
                hover:shadow-lg transition-all duration-500 cursor-default
                ${
                  visibleItems.has(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }
              `}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-dim">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Tag */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full">
                  {item.tag}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3
                  className="text-lg font-bold text-dark mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.name}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-text-muted mt-10">
          * Actual contents may vary. Each box is uniquely curated for the freshest experience.
        </p>
      </div>
    </section>
  );
}
