import WaitlistForm from "./WaitlistForm";

export default function OfferStack() {
  return (
    <section className="py-24 px-4 bg-gray-50 text-dark" id="offer-section">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" style={{ fontFamily: "var(--font-heading)" }}>
          Here&apos;s Exactly What You&apos;re Getting:
        </h2>

        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gray-900 text-white font-bold py-2 px-6 rounded-bl-2xl text-sm">
            Estimated Value: $65
          </div>
          
          <ul className="space-y-6 mt-8">
            <li className="flex items-start gap-4">
              <span className="text-2xl mt-1">✅</span>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Curated K-Food Selection</h3>
                <p className="text-gray-600 mt-1">Seoul&apos;s trendiest snacks &amp; drinks — the exact ones Korean Gen Z is obsessing over right now. (Value: $20)</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-2xl mt-1">✅</span>
              <div>
                <h3 className="font-bold text-xl text-gray-900">K-Beauty Essentials</h3>
                <p className="text-gray-600 mt-1">Premium sheet masks &amp; skincare minis from brands like Innisfree, Mediheal, and more. (Value: $25)</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
              <span className="text-2xl mt-1">🎁</span>
              <div>
                <h3 className="font-bold text-xl text-orange-900">Korean Lifestyle Goods</h3>
                <p className="text-orange-800 mt-1">Cute stationery, stickers, and accessories that capture Seoul&apos;s aesthetic. (Value: $10)</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
              <span className="text-2xl mt-1">🎁</span>
              <div>
                <h3 className="font-bold text-xl text-orange-900">Surprise K-Culture Collectible</h3>
                <p className="text-orange-800 mt-1">A different limited-edition item every month — you never know what Seoul surprise awaits! (Value: $10)</p>
              </div>
            </li>
          </ul>

          <div className="mt-12 text-center border-t-2 border-dashed border-gray-200 pt-10">
            <div className="inline-block bg-orange-50 text-orange-600 font-bold px-4 py-1 rounded-full text-sm mb-6 border border-orange-100">
              ✈️ Shipped direct from Seoul
            </div>
            
            <p className="text-gray-500 mb-2 uppercase tracking-wide font-bold">Launching Price</p>
            <div className="text-6xl font-black mb-8" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="line-through text-gray-300 text-4xl mr-4">$65</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">$45</span>
            </div>
            
            <WaitlistForm size="lg" />
            
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
