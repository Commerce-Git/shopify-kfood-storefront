import React, { useState } from "react";
import Image from "next/image";
import { MASTER_PRODUCTS, hydrateMasterProducts, type MasterProduct } from "@/lib/master-products";
import { useCart } from "./CartProvider";
import type { ShopifyProduct } from "@/lib/shopify/types";

interface MasterpieceGallerySectionProps {
  liveProducts?: ShopifyProduct[];
}

export default function MasterpieceGallerySection({ liveProducts }: MasterpieceGallerySectionProps) {
  const masterProductsList = liveProducts && liveProducts.length > 0 
    ? hydrateMasterProducts(liveProducts) 
    : MASTER_PRODUCTS;

  const { addToCart, setIsCartOpen } = useCart();
  const [hoveredSku, setHoveredSku] = useState<string | null>(null);
  const [addingSku, setAddingSku] = useState<string | null>(null);
  const [addedSku, setAddedSku] = useState<string | null>(null);

  const handleQuickAdd = (product: MasterProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingSku(product.sku);

    setTimeout(() => {
      addToCart({
        variantId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.image,
        handle: product.handle,
      });
      setAddingSku(null);
      setAddedSku(product.sku);
      setIsCartOpen(true);

      setTimeout(() => setAddedSku(null), 2000);
    }, 300);
  };

  return (
    <section className="py-24 px-4 sm:px-6 bg-white" id="masterpiece-gallery">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
            🏺 Masterpiece Gallery Collection
          </span>
          <h2 className="heading-lg text-dark">
            Pure Masterpiece <span className="gradient-text">8 Standalone Items</span>
          </h2>
          <p className="text-text-muted mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Original handcrafted creations directly from 8 certified Korean Master Artisans.
            Each piece is individually registered and prepared to order.
          </p>
        </div>

        {/* 4-Column Grid Layout for 8 Master Items */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {masterProductsList.map((product) => {
            const isHovered = hoveredSku === product.sku;
            const isAdding = addingSku === product.sku;
            const isAdded = addedSku === product.sku;

            return (
              <div
                key={product.sku}
                onMouseEnter={() => setHoveredSku(product.sku)}
                onMouseLeave={() => setHoveredSku(null)}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-border-light hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container with Rollover Animation */}
                <div className="relative aspect-square bg-surface-dim overflow-hidden">
                  {/* Primary Front Image */}
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className={`object-cover transition-all duration-500 ${
                      isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
                    }`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Rollover Detail Image */}
                  <Image
                    src={product.rolloverImage}
                    alt={`${product.title} detail`}
                    fill
                    className={`object-cover transition-all duration-500 ${
                      isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
                    }`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* SKU & Craft Status Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    <span className="bg-dark/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {product.sku}
                    </span>
                    <span className="bg-primary/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-sm">
                      {product.craftStatus}
                    </span>
                  </div>

                  {/* Quick Add Overlay Button on Hover */}
                  <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      disabled={isAdding}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                        isAdded
                          ? "bg-success text-white"
                          : isAdding
                          ? "bg-primary/80 text-white"
                          : "bg-white/95 hover:bg-primary text-dark hover:text-white backdrop-blur-md"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {isAdded ? (
                        <span>✓ Added to Cart!</span>
                      ) : isAdding ? (
                        <span>Adding...</span>
                      ) : (
                        <>
                          <span>⚡ Quick Add • ${product.price}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    {/* Artist Attribution Tag */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs">🎨</span>
                      <span className="text-xs font-bold text-primary truncate" style={{ fontFamily: "var(--font-heading)" }}>
                        by {product.artist}
                      </span>
                    </div>

                    {/* Product Title */}
                    <h3 className="font-semibold text-dark text-sm line-clamp-1 group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                      {product.englishTitle}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="pt-2 border-t border-border-light flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                        ${product.price}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-text-light line-through font-normal">
                          ${product.compareAtPrice}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-text-muted bg-surface-dim px-2 py-0.5 rounded font-medium">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
