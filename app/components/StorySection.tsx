export default function StorySection() {
  return (
    <section className="py-24 px-4 bg-white text-dark">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          The Problem With Loving Korean Culture...
        </h2>
        
        <div className="space-y-6 text-lg text-gray-700 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          <p>
            It always happens when you&apos;re deep into a K-Drama, scrolling through Korean TikTok, or watching a K-Beauty routine. You see products you&apos;ve never seen before — snacks, skincare, cute stationery — and you want them <em>right now</em>.
          </p>
          <p className="font-bold text-xl text-dark">
            Your heart races. You want it all.
          </p>
          <p>
            But your local stores only carry the same mainstream stuff. Even the &quot;international&quot; aisle doesn&apos;t have the <em>real</em> trending products from Seoul.
          </p>
          <p>
            I had this exact problem. I wanted to experience the culture I saw on screen — the snacks, the skincare, the lifestyle. So I started sourcing directly from Korea. But buying individual items cost a fortune in shipping.
          </p>
          
          <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100 my-10 relative">
            <div className="absolute -top-5 left-8 bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
              The Epiphany 💡
            </div>
            <h3 className="font-bold text-2xl mb-4 text-orange-900 mt-2" style={{ fontFamily: "var(--font-heading)" }}>
              What if there was a better way?
            </h3>
            <p className="text-orange-800">
              I realized: What if I could curate the ultimate box of <em>exactly</em> what&apos;s trending in Korea right now — snacks, K-Beauty, lifestyle goods — and ship it directly from Seoul to your door at one flat price?
            </p>
          </div>
          
          <p>
            That&apos;s why I created <strong>The Blank Seoul Box</strong>. It&apos;s not just a box; it&apos;s a curated piece of Korean culture, delivered to your door.
          </p>
        </div>
      </div>
    </section>
  );
}
