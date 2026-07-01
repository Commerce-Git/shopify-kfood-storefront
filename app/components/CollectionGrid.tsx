import Image from "next/image";
import Link from "next/link";

const COLLECTIONS = [
  {
    title: "Wear Tradition",
    subtitle: "Jewelry, Hairpins & Scrunchies",
    emoji: "🦋",
    href: "/collections/wear-tradition-jewelry-hair",
    image: "/assets/idus-products/456ac39c515a4d4cae17377a49172baa_512.jpg",
    gradient: "from-rose-900/80 to-pink-900/60",
  },
  {
    title: "Carry Art",
    subtitle: "Pouches, Bags & Wallets",
    emoji: "👜",
    href: "/collections/carry-art-bags-wallets",
    image: "/assets/idus-products/cd2619e7f712472d82816db297940c32_512.jpg",
    gradient: "from-indigo-900/80 to-blue-900/60",
  },
  {
    title: "Living & Home Decor",
    subtitle: "Coasters, Door Bells & Ornaments",
    emoji: "🍵",
    href: "/collections/living-home-decor",
    image: "/assets/idus-products/b901140d639c45b4b422561fdd4fc91b_512.jpg",
    gradient: "from-emerald-900/80 to-teal-900/60",
  },
  {
    title: "Accessories & Charms",
    subtitle: "Keyrings & Traditional Knots",
    emoji: "✨",
    href: "/collections/accessories-charms",
    image: "/assets/idus-products/6a74a43c1ccb4d218238e9da1d0dd26a_512.jpg",
    gradient: "from-amber-900/80 to-orange-900/60",
  },
];

export default function CollectionGrid() {
  return (
    <section className="py-24 px-4 bg-white" id="collections">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">
            Shop by Occasion
          </span>
          <h2 className="heading-lg text-dark">
            Find Your <span className="gradient-text">Perfect Piece</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative aspect-[16/9] rounded-2xl overflow-hidden"
            >
              {/* Background Image */}
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, 50vw"
              />

              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient}`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                <span className="text-3xl mb-2">{collection.emoji}</span>
                <h3
                  className="text-xl sm:text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {collection.title}
                </h3>
                <p className="text-white/70 text-sm">{collection.subtitle}</p>
                <span className="mt-3 text-white/90 text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
