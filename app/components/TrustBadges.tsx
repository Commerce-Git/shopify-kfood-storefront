const BADGES = [
  {
    emoji: "✈️",
    title: "Direct from Seoul",
    description:
      "Every piece is sourced and shipped directly from Korean artisans. No middleman, no mass production — straight from the maker's hands to yours.",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    emoji: "🧵",
    title: "Handcrafted with Care",
    description:
      "Each item is made by hand by independent Korean artisans. No two pieces are exactly alike — that's the beauty of handmade.",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    emoji: "💯",
    title: "100% Made in Korea",
    description:
      "We only work with artisans who craft their products entirely in Korea. Authentic Korean craftsmanship, guaranteed.",
    gradient: "from-indigo-500/10 to-blue-500/10",
  },
];

export default function TrustBadges() {
  return (
    <section className="section bg-white" id="trust-badges">
      <div className="section-inner">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
            Why Choose Us
          </span>
          <h2 className="heading-lg text-dark">
            Trusted by{" "}
            <span className="gradient-text">K-Culture Lovers</span>
          </h2>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {BADGES.map((badge) => (
            <div
              key={badge.title}
              className={`
                relative p-8 rounded-2xl text-center
                bg-gradient-to-br ${badge.gradient}
                border border-border-light
                hover:shadow-lg hover:-translate-y-1
                transition-all duration-300
              `}
            >
              {/* Emoji Icon */}
              <div className="text-5xl mb-5">{badge.emoji}</div>

              {/* Title */}
              <h3
                className="text-xl font-bold text-dark mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {badge.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-text-muted leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
