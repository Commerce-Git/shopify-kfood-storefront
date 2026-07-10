import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Learn about our mission to bring authentic Korean artisan goods to the world. Handcrafted in Korea, delivered to your door — discover the story behind Blank Seoul.",
};

const VALUES = [
  {
    icon: "🎯",
    title: "Curated, Not Random",
    description:
      "We personally visit artisan studios and select every item. No mass-produced goods — only the finest handcrafted pieces from Korea's most talented makers.",
  },
  {
    icon: "✈️",
    title: "Seoul to Your Door",
    description:
      "We ship directly from South Korea. Your items are authentic, carefully packaged, and exactly what you'd find in Seoul's best artisan markets.",
  },
  {
    icon: "🤝",
    title: "Supporting Independent Artisans",
    description:
      "We partner with independent Korean artisans and small workshops, bringing you handcrafted pieces you won't find anywhere else outside Korea.",
  },
  {
    icon: "💚",
    title: "100% Made in Korea",
    description:
      "Every product is crafted entirely in Korea by verified artisans. We guarantee authenticity and quality in every piece we sell.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero Banner */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-dark" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-4 block">
            Our Story
          </span>
          <h1 className="heading-xl text-white mb-6">
            Korea,{" "}
            <span className="gradient-text">to Your Door</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            We believe the best way to experience a culture is through its craft.
            Our mission is to bring authentic Korean artisan goods to
            K-Culture fans around the world.
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
                  It started with a simple realization — while K-Pop and K-Dramas
                  conquered the world, the incredible handcrafted goods made by
                  Korean artisans remained a hidden treasure, nearly impossible
                  to find outside Korea.
                </p>
                <p>
                  We visited artisan studios across Seoul and beyond — met the
                  fan painters, the fabric artists, the knot-tying masters.
                  Each piece they created told a story of heritage meeting
                  modern aesthetics.
                </p>
                <p>
                  That&apos;s why we created Blank Seoul — to bridge that gap.
                  We work directly with these talented artisans, curate their
                  finest pieces, and deliver them to your door. Each item is
                  a piece of Korea, handcrafted with care and ready to be
                  treasured.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-surface-dim relative">
                <Image
                  src="/assets/about-v3.png"
                  alt="Traditional craft workshop alley in Seoul"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full -z-10" />
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
            Ready to Experience{" "}
            <span className="gradient-text">Korea?</span>
          </h2>
          <p className="text-white/60 mb-8">
            Discover handcrafted Korean artisan goods — direct from Seoul
            to your door.
          </p>
          <Link href="/collections" className="btn-primary text-lg px-10 py-4">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
