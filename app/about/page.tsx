import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about our mission to bring the best of Korean culture to your doorstep. Curate Korea, Deliver Culture — premium K-Culture boxes shipped direct from Seoul.",
};

const VALUES = [
  {
    icon: "🎯",
    title: "Curated, Not Random",
    description:
      "We personally taste-test and select every item. No filler snacks — only the best of what Korea's food scene has to offer.",
  },
  {
    icon: "✈️",
    title: "Seoul to Your Door",
    description:
      "We ship directly from South Korea. Your snacks are fresh, authentic, and exactly what locals eat — not watered-down export versions.",
  },
  {
    icon: "🤝",
    title: "Supporting Small Makers",
    description:
      "We partner with local Korean snack makers and small businesses, bringing you hidden gems you won't find in mainstream stores.",
  },
  {
    icon: "💚",
    title: "FDA Compliant & Safe",
    description:
      "Every shipment undergoes proper FDA Prior Notice filing. We take food safety seriously so you can snack worry-free.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero Banner */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-dark" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-pink-500/10" />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-4 block">
            Our Story
          </span>
          <h1 className="heading-xl text-white mb-6">
            Gift a Piece of{" "}
            <span className="gradient-text">Korea</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            We believe the best way to experience a culture is through its food.
            Our mission is to bring the vibrant, exciting world of Korean culture
            to K-Culture fans across America.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
                How It Started
              </span>
              <h2 className="heading-md text-dark mb-6">
                Born from a Love of K-Culture
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  It started with a simple moment — sharing Korean snacks with
                  American friends and watching their eyes light up with every
                  bite. The honey butter chips, the spicy tteokbokki crackers,
                  the impossibly soft choco pies... every snack told a story.
                </p>
                <p>
                  We realized that while K-Pop and K-Dramas had conquered the
                  world, K-Culture products were still a hidden treasure. Most fans
                  had to rely on overpriced imports or limited Asian grocery
                  store selections.
                </p>
                <p>
                  That&apos;s why we created Blank Seoul — to bridge that gap.
                  We curate the best of Korea directly from Seoul, package it
                  with care, and ship them to your door. Each box is a little
                  piece of Korea, ready to be unwrapped and enjoyed.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-surface-dim relative">
                <Image
                  src="/images/about-story.webp"
                  alt="Korean street food market at night"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-pink-400/10 rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-surface-dim">
        <div className="section-inner">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
              Our Values
            </span>
            <h2 className="heading-lg text-dark">
              What Makes Us{" "}
              <span className="gradient-text">Different</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-8 hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3
                  className="text-lg font-bold text-dark mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {value.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-dark text-white text-center">
        <div className="section-inner max-w-2xl">
          <h2 className="heading-lg text-white mb-4">
            Ready to Taste{" "}
            <span className="gradient-text">Korea?</span>
          </h2>
          <p className="text-white/60 mb-8">
            Order your curated Blank Seoul Box today and discover a world of
            culture from Seoul.
          </p>
          <Link href="/" className="btn-primary text-lg px-10 py-4">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
