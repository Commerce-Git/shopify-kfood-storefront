import BuyButton from "./BuyButton";

interface OfferStackProps {
  variantId?: string;
}

export default function OfferStack({ variantId }: OfferStackProps) {
  return (
    <section className="py-24 px-4 bg-gray-50 text-dark" id="offer-section">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" style={{ fontFamily: "var(--font-heading)" }}>
          Here&apos;s Exactly What You&apos;re Getting Today:
        </h2>

        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gray-900 text-white font-bold py-2 px-6 rounded-bl-2xl text-sm">
            Estimated Value: $65
          </div>
          
          <ul className="space-y-6 mt-8">
            <li className="flex items-start gap-4">
              <span className="text-2xl mt-1">✅</span>
              <div>
                <h3 className="font-bold text-xl text-gray-900">The K-Drama Bestseller Snack Pack</h3>
                <p className="text-gray-600 mt-1">The 10+ exact snacks trending in Seoul right now. (Value: $35)</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-2xl mt-1">✅</span>
              <div>
                <h3 className="font-bold text-xl text-gray-900">The &quot;Spicy Ramen Challenge&quot; Kit</h3>
                <p className="text-gray-600 mt-1">Authentic Korean ramen varieties you can&apos;t easily find locally. (Value: $25)</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
              <span className="text-2xl mt-1">🎁</span>
              <div>
                <h3 className="font-bold text-xl text-orange-900">Surprise K-Pop Photo Card</h3>
                <p className="text-orange-800 mt-1">A fun collectible photo card included in every box. (Value: $5)</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
              <span className="text-2xl mt-1">🎁</span>
              <div>
                <h3 className="font-bold text-xl text-orange-900">K-Convenience Store Recipe Guide</h3>
                <p className="text-orange-800 mt-1">Digital guide to mixing snacks like a Seoul local (Mark&apos;s Meal, etc.). (Value: $5)</p>
              </div>
            </li>
          </ul>

          <div className="mt-12 text-center border-t-2 border-dashed border-gray-200 pt-10">
            <div className="inline-block bg-orange-50 text-orange-600 font-bold px-4 py-1 rounded-full text-sm mb-6 border border-orange-100">
              ✈️ Shipped direct from Seoul
            </div>
            
            <p className="text-gray-500 mb-2 uppercase tracking-wide font-bold">Today&apos;s Price</p>
            <div className="text-6xl font-black mb-8" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="line-through text-gray-300 text-4xl mr-4">$65</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">$45</span>
            </div>
            
            {variantId ? (
              <BuyButton 
                variantId={variantId} 
                label="Yes! Send Me The Blank Seoul Box 🚀" 
                size="lg" 
              />
            ) : (
              <span className="btn-primary text-lg px-10 py-4 opacity-70 cursor-not-allowed inline-block">
                Coming Soon
              </span>
            )}
            
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1">✈️ Ships from Seoul</span>
              <span>•</span>
              <span className="flex items-center gap-1">🛡️ 100% Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
