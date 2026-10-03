'use client';

import React, { useState } from 'react';

// Guidance only: opening a FAQ never submits an inquiry or changes an order.
export const SUPPORT_FAQS = [
  { id: 'tracking', label: 'Where is my order?',
    answer: 'Find your order to check its available status and tracking. Message our team if you need help with an update.',
    action: { label: 'Find my order', href: '/order-lookup' } },
  { id: 'shipping', label: 'Production & delivery',
    answer: 'Check the product details and shipping policy for available information. For a specific arrival date, tell us your destination country and our team will check with the maker.',
    action: { label: 'Shipping policy', href: '/policies/shipping' } },
  { id: 'cancellation', label: 'Cancellation options',
    answer: 'Find your order to see available cancellation options. If you cannot cancel there, contact support with your order number. Viewing this answer does not submit a cancellation request.',
    action: { label: 'Find my order', href: '/order-lookup' } },
  { id: 'returns', label: 'Returns, exchanges & refunds',
    answer: 'Check our return policy for eligibility. For a return, exchange or damaged item, message support with your order number and details. Our team will review your request; viewing this answer does not start a return or refund.',
    action: { label: 'Return & refund policy', href: '/policies/returns' } },
];

export function InquiryPrivacyNotice() {
  return <p className="text-xs leading-relaxed text-zinc-500">
    Support reviews your messages and shares details with the maker when needed.{' '}
    <a href="/policies/privacy#support-messages" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 focus-visible:outline-2">Privacy Policy</a>
  </p>;
}

export default function SupportFaqIntro({ contextType, onContact }: {
  contextType?: 'product' | 'artist' | 'order';
  onContact: (question: string | null) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const items = SUPPORT_FAQS.filter(item => contextType === 'order' ? item.id !== 'shipping' : contextType ? item.id !== 'tracking' : true);
  const faq = items.find(item => item.id === selected);
  return <div className="space-y-2">
    <h4 className="text-xs font-medium text-zinc-500">Quick answers</h4>
    <div role="group" aria-label="Frequently asked questions" className="overflow-hidden rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-200">
      {items.map(item => <React.Fragment key={item.id}>
        <button type="button" aria-expanded={selected === item.id} aria-controls={`support-faq-${item.id}`}
          onClick={() => { const next = selected === item.id ? null : item.id; setSelected(next); onContact(next ? item.label : null); }}
          className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2">
          {item.label}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`shrink-0 text-zinc-400 transition-transform motion-reduce:transition-none ${selected === item.id ? 'rotate-90' : ''}`}><path d="m9 5 7 7-7 7" /></svg>
        </button>
        <section id={`support-faq-${item.id}`} hidden={selected !== item.id} aria-label="FAQ answer" className="bg-zinc-50 px-3 py-3">
          {selected === item.id && faq && <>
            <p className="mb-2 text-xs font-medium text-zinc-500">FAQ · Automatic answer</p>
            <p className="text-sm leading-relaxed text-zinc-700">{faq.answer}</p>
            <a href={faq.action.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">{faq.action.label}<span className="sr-only"> (opens in a new tab)</span> →</a>
          </>}
        </section>
      </React.Fragment>)}
    </div>
  </div>;
}
