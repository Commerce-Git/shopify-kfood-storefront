import Image from "next/image";
import Link from "next/link";
import type { ShopifyCollection } from "@/lib/shopify/types";

const COLLECTIONS = [
  {
    title: "Wear Tradition",
    subtitle: "Jewelry, Hairpins & Scrunchies",
    emoji: "🦋",
    href: "/collections/wear-tradition-accessories",
    image: "/assets/idus-products/456ac39c515a4d4cae17377a49172baa_512.jpg",
    gradient: "from-rose-900/80 to-pink-900/60",
  },
  {
    title: "Carry Art",
    subtitle: "Pouches, Bags & Wallets",
    emoji: "👜",
    href: "/collections/carry-art-bags",
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
    href: "/collections/wear-tradition-accessories",
    image: "/assets/idus-products/6a74a43c1ccb4d218238e9da1d0dd26a_512.jpg",
    gradient: "from-amber-900/80 to-orange-900/60",
  },
];

interface CollectionGridProps {
  collections?: ShopifyCollection[];
}

const GRADIENTS = [
  "from-rose-900/80 to-pink-900/60",
  "from-indigo-900/80 to-blue-900/60",
  "from-emerald-900/80 to-teal-900/60",
  "from-amber-900/80 to-orange-900/60",
];

const EMOJIS = ["🦋", "👜", "🍵", "✨", "🌸", "🎀", "💎", "🎁"];

export default function CollectionGrid({ collections }: CollectionGridProps) {
  const hasCollections = collections && collections.length > 0;

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
        <div className={
          hasCollections && collections.length === 3
            ? "grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6"
            : "grid grid-cols-2 gap-3 lg:gap-6"
        }>
          {hasCollections ? (
            collections.slice(0, 4).map((collection, index) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className={`group relative aspect-[16/9] rounded-2xl overflow-hidden ${
                  collections.length === 3 && index === 2 ? "col-span-2 md:col-span-1" : ""
                }`}
              >
                <div className="relative w-full h-full bg-surface-dim">
                  <Image
                    src={
                      collection.image?.url ||
                      collection.products?.edges?.[0]?.node?.images?.edges?.[0]?.node?.url ||
                      "/assets/blank_seoul_symbol.png"
                    }
                    alt={collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, 50vw"
                    priority={index < 2}
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t ${GRADIENTS[index % GRADIENTS.length]}`} />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8">
                  <span className="text-xl sm:text-3xl mb-1 sm:mb-2">{EMOJIS[index % EMOJIS.length]}</span>
                  <h3
                    className="text-sm sm:text-2xl font-bold text-white mb-0.5 sm:mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {collection.title}
                  </h3>
                  <p className="text-white/70 text-[10px] sm:text-sm line-clamp-1 sm:line-clamp-2">{collection.description || "Discover this collection"}</p>
                  <span className="mt-1 sm:mt-3 text-white/90 text-xs sm:text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                    Explore →
                  </span>
                </div>
              </Link>
            ))
          ) : (
            COLLECTIONS.map((collection, index) => (
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
                  sizes="(max-width: 640px) 50vw, 50vw"
                  priority={index < 2}
                />

                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient}`} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8">
                  <span className="text-xl sm:text-3xl mb-1 sm:mb-2">{collection.emoji}</span>
                  <h3
                    className="text-sm sm:text-2xl font-bold text-white mb-0.5 sm:mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {collection.title}
                  </h3>
                  <p className="text-white/70 text-[10px] sm:text-sm line-clamp-1 sm:line-clamp-2">{collection.subtitle}</p>
                  <span className="mt-1 sm:mt-3 text-white/90 text-xs sm:text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                    Explore →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
