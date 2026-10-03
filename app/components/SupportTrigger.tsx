"use client";

import React from "react";
import Link from "next/link";
import { openSupport } from '../../lib/inquiries/openSupport';

/** One support entry point; order references are context, never proof of ownership. */
export default function SupportTrigger({ orderNumber, children = 'Contact customer support', className = '' }: {
  orderNumber?: string; children?: React.ReactNode; className?: string;
}) {
  return <Link href="/?chat=open" className={className} onClick={event => {
    event.preventDefault();
    openSupport({ intent: orderNumber ? 'contextual' : 'general', product: orderNumber ? {
      type: 'order', title: `Order ${orderNumber}`, handle: `orders/${orderNumber}`, orderNumber,
    } : null });
  }}>{children}</Link>;
}
