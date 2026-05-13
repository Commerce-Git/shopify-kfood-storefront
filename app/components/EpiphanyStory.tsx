"use client";

import { useEffect, useRef, useState } from "react";

export default function EpiphanyStory() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section bg-white"
      id="our-story"
    >
      <div className="section-inner max-w-3xl mx-auto">
        <div
          className={`
            transition-all duration-1000
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">
              Our Story
            </span>
          </div>

          {/* Letter-style story */}
          <div className="space-y-5 text-lg leading-relaxed text-text" style={{ fontFamily: "var(--font-body)" }}>
            <p>
              <span className="text-2xl font-bold text-dark" style={{ fontFamily: "var(--font-heading)" }}>
                We had a problem.
              </span>
            </p>

            <p className="text-text-muted">
              Living in the US, we were obsessed with K-Dramas and the snacks
              we kept seeing on screen — from honey butter chips to spicy ramen,
              to those mysterious convenience store treats. But when we tried to
              find them? The local Asian mart had outdated stock. Amazon sold
              bulk packs of the same old thing. And nothing came close to what
              Korean Gen Z is actually using and eating right now.
            </p>

            <p className="text-text-muted">
              So we did what any K-Culture fan would do —{" "}
              <span className="text-dark font-semibold">
                we flew to Seoul and raided the trendiest convenience stores ourselves.
              </span>
            </p>

            <p className="text-text-muted">
              Now, every month, we curate a box of{" "}
              <span className="text-dark font-semibold">
                the exact products Korean Gen Z is obsessing over right now
              </span>{" "}
              — the viral snacks, the cult-favorite K-Beauty, the hidden lifestyle gems
              you simply can&apos;t get anywhere else. FDA-cleared, shipped via EMS from Seoul to
              your doorstep in 5-10 days.
            </p>

            <p className="text-dark font-semibold text-xl" style={{ fontFamily: "var(--font-heading)" }}>
              This isn&apos;t just a box.{" "}
              <span className="gradient-text">It&apos;s a piece of Seoul.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
