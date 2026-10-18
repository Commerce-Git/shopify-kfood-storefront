'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="mx-auto w-full max-w-lg px-5 py-16 text-center">
    <h1 className="text-xl font-semibold">We couldn’t load this page</h1>
    <p role="alert" className="mt-3 text-sm text-zinc-600">Please try again. Your bag is still saved.</p>
    <button onClick={reset} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white">Try again</button>
    <Link href="/collections" className="ml-4 inline-flex min-h-11 items-center text-sm underline">Browse products</Link>
  </section>;
}
