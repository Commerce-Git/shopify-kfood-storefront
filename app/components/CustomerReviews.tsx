export default function CustomerReviews() {
  const reviews = [
    {
      name: "Sarah M.",
      verified: true,
      text: "I was so thrilled when I saw the Choco Pies and the exact ramen from Reply 1988! It felt like Christmas. Everything was fresh and shipped surprisingly fast.",
    },
    {
      name: "Jessica K.",
      verified: true,
      text: "Way better than the subscription boxes. No weird filler snacks, just the actual good stuff. The bonus photo card was a huge surprise. Highly recommend!",
    },
    {
      name: "David T.",
      verified: true,
      text: "Got this for my girlfriend who is obsessed with K-Dramas. Best boyfriend award secured. The recipe PDF was actually super helpful for making the ramen.",
    }
  ];

  return (
    <section className="py-24 px-4 bg-white text-dark">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16" style={{ fontFamily: "var(--font-heading)" }}>
          What Other K-Drama Fans Are Saying
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm relative mt-4">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg border-4 border-white">
                {review.name.charAt(0)}
              </div>
              <div className="flex text-yellow-400 mb-4 mt-2 text-xl">
                ★★★★★
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                &quot;{review.text}&quot;
              </p>
              <div>
                <p className="font-bold text-gray-900">{review.name}</p>
                {review.verified && (
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Verified Buyer
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
