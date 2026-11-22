"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { countryProductPath } from "@/lib/markets/selection";
import { PRODUCT_SUGGESTIONS } from "@/lib/shopify/queries";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { useMarket } from "./MarketProvider";

interface Suggestion {
  handle: string;
  title: string;
  featuredImage: { url: string } | null;
}

interface SearchProps {
  query: string;
  onChange: (query: string) => void;
  className: string;
}

export default function HeaderProductSearch({ query, onChange, className }: SearchProps) {
  const { country } = useMarket();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const term = query.trim();
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState<{ term: string; country: string; products: Suggestion[] } | null>(null);
  const products = focused && result?.term === term && result.country === country ? result.products : [];
  const open = products.length > 0;
  const searchPath = `/search?q=${encodeURIComponent(term)}`;

  useEffect(() => {
    if (!focused || term.length < 2 || !country) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const data = await storefrontFetch<{ predictiveSearch: { products: Suggestion[] } | null }>(
          PRODUCT_SUGGESTIONS, { query: term, country }, { cache: "no-store", signal: controller.signal }
        );
        if (!controller.signal.aborted) setResult({ term, country, products: data.predictiveSearch?.products ?? [] });
      } catch {
        if (!controller.signal.aborted) setResult(null);
      }
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [country, focused, term]);

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId, open]);

  function dismiss() {
    setFocused(false);
    setActive(-1);
  }
  function change(value: string) {
    onChange(value);
    setFocused(true);
    if (value.trim() !== term) setResult(null);
    setActive(-1);
  }
  const options = products.map(product => ({
    label: product.title, image: product.featuredImage?.url, href: countryProductPath(country, product.handle),
  }));
  if (open) options.push({ label: `Search for “${term}”`, image: undefined, href: searchPath });

  return <form role="search" action="/search" className={className}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) dismiss(); }}
    onSubmit={event => {
      event.preventDefault();
      if (term) { dismiss(); router.push(searchPath); }
    }}>
    <div className="relative flex w-full items-center">
      <input ref={input} name="q" role="combobox" aria-label="Search products" aria-autocomplete="list"
        aria-expanded={open} aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off" enterKeyHint="search" maxLength={200} placeholder="Search products" value={query}
        onFocus={() => setFocused(true)} onChange={event => change(event.target.value)}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape") { dismiss(); return; }
          if (!open) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive(index => Math.min(index + 1, options.length - 1));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(index => index < 0 ? options.length - 1 : Math.max(0, index - 1));
          }
          if (event.key === "Enter" && options[active]) {
            event.preventDefault();
            dismiss();
            router.push(options[active].href);
          }
        }}
        className="w-full rounded-full border-2 border-[#18181B] bg-white py-2.5 pl-4 pr-16 text-xs font-medium text-[#18181B] placeholder-[#6B7280] shadow-2xs focus:border-[#C25E38] focus:outline-none md:py-3 md:pl-5 md:pr-20 md:text-sm" />
      {query && <button type="button" aria-label="Clear search" className="absolute right-10 p-1 text-xs text-zinc-600 md:right-12"
        onClick={() => { change(""); input.current?.focus(); }}>✕</button>}
      <button type="submit" aria-label="Search" className="absolute right-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#C25E38] text-white hover:bg-[#A74B28] md:size-9">
        <svg aria-hidden="true" className="size-[13px] md:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
      </button>
    </div>
    {open && <ul id={listId} role="listbox" aria-label="Product suggestions"
      className="absolute inset-x-0 top-full z-50 mt-1 max-h-[45dvh] overflow-auto rounded-2xl border border-zinc-200 bg-white p-1 shadow-lg">
      {options.map((option, index) => <li key={option.href} role="presentation">
        <Link id={`${listId}-${index}`} href={option.href} prefetch={false} role="option" aria-selected={active === index}
          tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={dismiss}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-100 aria-selected:bg-zinc-100 ${index === products.length ? "font-semibold" : ""}`}>
          {option.image && <Image src={option.image} width={36} height={36} alt="" className="size-9 shrink-0 rounded-md object-cover" />}
          <span className="truncate">{option.label}</span>
        </Link>
      </li>)}
    </ul>}
  </form>;
}
