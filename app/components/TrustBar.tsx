import React from "react";

export default function TrustBar() {
  const trustItems = [
    {
      icon: "🎨",
      title: "100% Handcrafted by Artisans",
      description: "Directly created by 8 certified Korean Master Craftsmen",
    },
    {
      icon: "✈️",
      title: "Express Global Shipping",
      description: "Dispatched direct from Seoul with 100% safe arrival guarantee",
    },
    {
      icon: "🎁",
      title: "Signature Gift Wrapping",
      description: "Includes official Master Artisan Authenticity Certificate & Gift Box",
    },
  ];

  return (
    <section className="py-8 bg-dark text-white border-y border-white/10" id="trust-bar">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-white/10">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 justify-center md:justify-start ${
                index !== 0 ? "pt-6 md:pt-0 md:pl-8" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl flex-shrink-0 border border-white/15">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base" style={{ fontFamily: "var(--font-heading)" }}>
                  {item.title}
                </h4>
                <p className="text-xs text-white/60 mt-0.5 leading-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
