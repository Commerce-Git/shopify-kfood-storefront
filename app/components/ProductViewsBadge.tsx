"use client";

import { useState, useEffect } from "react";

interface ProductViewsBadgeProps {
  productHandle: string;
  className?: string;
}

export default function ProductViewsBadge({
  productHandle,
  className = "",
}: ProductViewsBadgeProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchAndIncrement() {
      try {
        const res = await fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: productHandle }),
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setViewCount(typeof data.viewCount === "number" ? data.viewCount : 0);
        }
      } catch (err) {
        console.error("[ProductViewsBadge] Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAndIncrement();

    return () => {
      isMounted = false;
    };
  }, [productHandle]);

  if (loading) {
    return (
      <div className={`h-6 w-32 bg-[#F4EFE6]/60 animate-pulse rounded-full border border-[#E8DFC8]/50 ${className}`} />
    );
  }

  const count = viewCount || 0;

  // 2026 Smart Threshold Social Proof Logic
  let icon = "✨";
  let label = "Just Arrived from Seoul Atelier";

  if (count >= 100) {
    const rounded = Math.floor(count / 10) * 10;
    icon = "🔥";
    label = `Trending Now · ${rounded}+ views this week`;
  } else if (count >= 20) {
    const rounded = Math.floor(count / 10) * 10;
    icon = "👀";
    label = `Popular · ${rounded}+ views`;
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        bg-[#FDF9F3] border border-[#E8DFC8] text-[11px] font-bold text-[#C25E38]
        shadow-2xs transition-all duration-300 animate-fade-in shrink-0
        ${className}
      `}
    >
      <span className="text-xs shrink-0">{icon}</span>
      <span className="tracking-tight">{label}</span>
    </div>
  );
}
