const BADGES = [
  {
    emoji: "✈️",
    title: "Direct Dispatch from Korea",
    description:
      "Every piece is curated in Seoul and shipped directly from South Korea with end-to-end international air tracking straight to your door.",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    emoji: "🏛️",
    title: "Verified Domestic Quality",
    description:
      "Curated from verified South Korean makers and studios. Meticulous quality inspection at our central Korea hub before dispatch.",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    emoji: "🇰🇷",
    title: "Made in Korea",
    description:
      "We strictly partner with domestic manufacturers and designers. Authentic South Korean manufacturing origin guaranteed.",
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
