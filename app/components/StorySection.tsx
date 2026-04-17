export default function StorySection() {
  return (
    <section className="py-24 px-4 bg-white text-dark">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          The Problem With Watching K-Dramas...
        </h2>
        
        <div className="space-y-6 text-lg text-gray-700 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          <p>
            It always happens at 2 AM. You&apos;re deep into an episode, and suddenly the characters are eating ramen at a convenience store or pulling out a mysterious snack you&apos;ve never seen before.
          </p>
          <p className="font-bold text-xl text-dark">
            Your mouth waters. You want it right now.
          </p>
          <p>
            But when you go to your local grocery store, they only have the same boring chips. Even the &quot;international&quot; aisle doesn&apos;t have the <em>real</em> stuff they eat in Seoul.
          </p>
          <p>
            I had this exact problem. I wanted to experience the flavors I saw on screen. So, I started sourcing directly from Korea. But shipping individual snacks cost a fortune ($40+ just for shipping!).
          </p>
          
          <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100 my-10 relative">
            <div className="absolute -top-5 left-8 bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
              The Epiphany 💡
            </div>
            <h3 className="font-bold text-2xl mb-4 text-orange-900 mt-2" style={{ fontFamily: "var(--font-heading)" }}>
              What if there was a better way?
            </h3>
            <p className="text-orange-800">
              I realized: What if I could curate the ultimate box of the <em>exact</em> viral snacks, ramen, and drinks trending in Korea right now, and ship it directly from Seoul to your door—without the crazy international shipping fees?
            </p>
          </div>
          
          <p>
            That&apos;s why I created <strong>The Ultimate Seoul Box</strong>. It&apos;s not just a box of snacks; it&apos;s a 1st-class ticket to a Korean convenience store.
          </p>
        </div>
      </div>
    </section>
  );
}
