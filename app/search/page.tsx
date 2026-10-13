import Link from 'next/link';
import type { Metadata } from 'next';
import ProductCard from '../components/ProductCard';
import { searchProducts } from '@/lib/shopify/api';

export const metadata: Metadata = { title: 'Search products — Blank Seoul', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[]; after?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 200) : '';
  const after = typeof params.after === 'string' ? params.after.slice(0, 1000) : null;
  let result: Awaited<ReturnType<typeof searchProducts>> | null = null;
  let failed = false;
  if (query) {
    try { result = await searchProducts(query, after); }
    catch { failed = true; }
  }
  return <section className="mx-auto w-full max-w-6xl px-4 py-6 pb-28">
    <h1 className="text-xl font-bold">Search products</h1>
    <form action="/search" className="my-5 flex gap-2" role="search">
      <label htmlFor="product-search" className="sr-only">Search products</label>
      <input key={query} id="product-search" type="search" name="q" defaultValue={query} required maxLength={200}
        placeholder="Product, maker or keyword" className="min-h-11 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-base" />
      <button className="min-h-11 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white">Search</button>
    </form>
    {failed ? <div role="alert" className="rounded-xl border border-zinc-200 bg-white p-5 text-sm">
      <p>Search is temporarily unavailable. Please try again.</p>
      <a className="mt-3 inline-flex min-h-11 items-center underline" href={`/search?q=${encodeURIComponent(query)}`}>Retry search</a>
    </div> : !query ? <p className="text-sm text-zinc-600">Enter a product, maker or keyword to search.</p> : <>
      <p className="mb-5 break-words text-sm text-zinc-600">{result?.totalCount || 0} results for “{query}”</p>
      {result?.products.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {result.products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}
      </div> : <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm">
        <h2 className="font-semibold">No matching products</h2>
        <p className="mt-2 text-zinc-600">Try a shorter keyword or browse all products.</p>
        <Link href="/collections" className="mt-3 inline-flex min-h-11 items-center underline">Browse all products</Link>
      </div>}
      {result?.pageInfo.hasNextPage && result.pageInfo.endCursor && <Link
        className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-semibold"
        href={`/search?${new URLSearchParams({ q: query, after: result.pageInfo.endCursor })}`}>
        Next results →
      </Link>}
    </>}
  </section>;
}
