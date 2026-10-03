'use client';

import React, { useEffect, useRef, useState } from 'react';

// Navigation/help instructions only. Do not add delivery/refund promises without confirmed policy.
export const SUPPORT_FAQS = [
  {
    id: 'tracking', label: 'Where is my order?',
    answer: 'Find your order to check the available status. If an update is unclear, contact our team with your order number.',
    action: { label: 'Find my order', href: '/order-lookup' },
  },
  {
    id: 'shipping', label: 'I have a delivery question',
    answer: 'Check order lookup for an existing order. Before ordering, send us the product name and destination country so our team can check delivery details.',
    action: { label: 'Check an existing order', href: '/order-lookup' },
  },
  {
    id: 'returns', label: 'Cancellation, returns or damaged items',
    answer: 'Open your order to see available cancellation options. For returns, damage or other changes, send your order number and a description to support. Our team will review the request.',
    action: { label: 'Find my order', href: '/order-lookup' },
  },
  {
    id: 'product', label: 'Materials, sizing or product care',
    answer: 'Check the materials, dimensions and care information on the product page. Need more detail? Send us the product name or link and our team will check with the maker.',
  },
];

export function InquiryPrivacyNotice() {
  return <p className="text-xs leading-relaxed text-zinc-500">
    We use your information to handle your inquiry.{' '}
    <a href="/policies/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 focus-visible:outline-2">View our Privacy Policy.</a>
  </p>;
}

export default function SupportFaqIntro({ onContact }: { onContact: (question: string | null) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const answerRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const firstQuestionRef = useRef<HTMLButtonElement>(null);
  const faq = SUPPORT_FAQS.find(item => item.id === selected);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    if (selected) answerRef.current?.focus({ preventScroll: true });
  }, [selected]);

  const showQuestions = () => {
    setSelected(null);
    requestAnimationFrame(() => firstQuestionRef.current?.focus({ preventScroll: true }));
  };

  return <div className="flex h-full min-h-0 flex-col">
    <div ref={bodyRef} tabIndex={0} aria-label="FAQ content" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
      {!faq ? <>
        <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-zinc-200 bg-white p-4 text-sm leading-relaxed shadow-sm">
          <p className="mb-1 font-semibold text-zinc-900">Hi! How can we help?</p>
          <p className="text-zinc-600">Choose a question for a quick answer, or message our support team.</p>
        </div>
        <div className="space-y-2" role="group" aria-label="Frequently asked questions">
          {SUPPORT_FAQS.map((item, index) => <button key={item.id} ref={index === 0 ? firstQuestionRef : undefined} type="button" onClick={() => setSelected(item.id)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm text-zinc-800 hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2">
            {item.label}<span aria-hidden="true">›</span>
          </button>)}
        </div>
      </> : <>
        <div className="self-end max-w-[90%] rounded-2xl rounded-br-sm bg-zinc-900 px-4 py-3 text-sm text-white">{faq.label}</div>
        <section aria-label="FAQ answer" className="max-w-[95%] rounded-2xl rounded-tl-sm border border-zinc-200 bg-white p-4 shadow-sm">
          <h4 ref={answerRef} tabIndex={-1} className="mb-2 text-xs font-semibold text-zinc-500 focus:outline-none">FAQ · Automatic answer</h4>
          <p className="text-sm leading-relaxed text-zinc-700">{faq.answer}</p>
          {faq.action && <a href={faq.action.href} className="mt-3 flex min-h-11 items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2">{faq.action.label} →</a>}
        </section>
      </>}
    </div>
    <div role="group" aria-label="Support actions" className="shrink-0 border-t border-zinc-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {faq ? <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={showQuestions} className="min-h-11 rounded-lg px-2 text-sm text-zinc-600 underline underline-offset-4 focus-visible:outline-2">Other questions</button>
        <button type="button" onClick={() => onContact(faq.label)} className="min-h-11 rounded-lg border border-zinc-300 px-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus-visible:outline-2">Contact support</button>
      </div> : <button type="button" onClick={() => onContact(null)} className="min-h-11 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2">Contact Blank Seoul support</button>}
      <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500">Our team replies after reviewing your message.</p>
    </div>
  </div>;
}
