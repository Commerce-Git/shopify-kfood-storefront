const BADGES = [
  {
    emoji: "✈️",
    title: "Direct from Seoul",
    description:
      "Every snack is sourced and shipped directly from South Korea. No middleman, no warehouse — just fresh, authentic flavors.",
    gradient: "from-blue-500/10 to-purple-500/10",
  },
  {
    emoji: "✅",
    title: "FDA Compliant",
    description:
      "All products are properly declared and comply with US FDA regulations. Your safety is our priority.",
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    emoji: "💯",
    title: "100% Authentic",
    description:
      "We only source from verified Korean manufacturers and distributors. Every snack is the real deal.",
    gradient: "from-pink-500/10 to-rose-500/10",
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
            <span className="gradient-text">K-Food Lovers</span>
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
