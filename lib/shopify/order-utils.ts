/**
 * Map order status to a display-friendly step number (0-4).
 *
 * 5-Stage Delivery Pipeline:
 *  0: Ordered    📝  (주문 접수)
 *  1: Preparing  🎨  (상품 준비 중)
 *  2: Packaging  📦  (검수/포장 중)
 *  3: In Transit ✈️  (해외 배송 중)
 *  4: Delivered  🏠  (배달 완료)
 */
export function getOrderStep(
  fulfillmentStatus: string,
  wmsStatus?: string
): { step: number; label: string } {
  if (wmsStatus) {
    switch (wmsStatus) {
      case "delivered":
        return { step: 4, label: "Delivered" };
      case "shipped":
        return { step: 3, label: "In Transit" };
      case "packaging":
        return { step: 2, label: "Packaging" };
      case "crafting":
        return { step: 1, label: "Preparing" };
      case "placed":
      default:
        return { step: 0, label: "Order Placed" };
    }
  }

  // Fallback for old cache missing wmsStatus
  switch (fulfillmentStatus) {
    case "FULFILLED":
      return { step: 3, label: "In Transit" };
    default:
      return { step: 0, label: "Order Placed" };
  }
}

import { getArtistSlug, getArtistBySlug } from "@/lib/artists";
import { aggregateWmsStatus } from "@/lib/orders/status";
import type { OrderPackage, OrderPackageItem, AdminFulfillment } from "@/lib/shopify/admin";

/**
 * Generate 1-click official direct carrier tracking URL.
 */
export function getCarrierTrackingUrl(trackingNumber?: string | null, company?: string | null): string | null {
  if (!trackingNumber) return null;
  const clean = trackingNumber.trim();
  const comp = (company || "").toLowerCase();

  // If already a full URL
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  // USPS tracking
  if (comp.includes("usps") || /^(94|92|93|82)\d{18,}/.test(clean)) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(clean)}`;
  }

  // Korea Post EMS / K-Packet (e.g. EG...KR, LX...KR)
  if (comp.includes("post") || comp.includes("korea") || comp.includes("ems") || /^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(clean)) {
    return `https://service.epost.go.kr/trace.RetrieveDomRcvTraceList.comm?sid1=${encodeURIComponent(clean)}`;
  }

  // Universal 17track fallback
  return `https://t.17track.net/en#nums=${encodeURIComponent(clean)}`;
}

/**
 * Split an order into clean atelier-unit packages.
 */
export function splitOrderIntoVendorPackages(params: {
  orderId: string;
  lineItems: Array<{
    node: {
      title: string;
      quantity: number;
      variantId: string | null;
      vendor?: string | null;
      variant: {
        title: string | null;
        price: { amount: string; currencyCode: string };
        image: { url: string; altText: string | null } | null;
      } | null;
    };
  }>;
  artistStatusMap?: Record<string, string>; // e.g. { "blank seoul": "shipped", "blank-seoul": "shipped" }
  orderFulfillmentStatus?: string;
  orderWmsStatus?: string;
  orderTracking?: { number: string | null; url: string | null; company: string | null } | null;
  fulfillments?: AdminFulfillment[] | null;
  deliveredAt?: string | null;
}): OrderPackage[] {
  const {
    orderId,
    lineItems,
    artistStatusMap = {},
    orderFulfillmentStatus,
    orderWmsStatus,
    orderTracking,
    fulfillments,
    deliveredAt,
  } = params;

  // 1. Group items by canonical vendor (case-insensitive & trimmed)
  const vendorGroups = new Map<string, { displayName: string; items: OrderPackageItem[] }>();

  for (const { node } of lineItems) {
    const rawVendor = node.vendor?.trim() || "Blank Seoul";
    const canonicalKey = rawVendor.toLowerCase().trim();
    if (!vendorGroups.has(canonicalKey)) {
      vendorGroups.set(canonicalKey, { displayName: rawVendor, items: [] });
    }
    vendorGroups.get(canonicalKey)!.items.push({
      title: node.title,
      quantity: node.quantity,
      variantId: node.variantId,
      variantTitle: node.variant?.title || null,
      price: node.variant?.price || { amount: "0.00", currencyCode: "USD" },
      image: node.variant?.image || null,
    });
  }

  const packages: OrderPackage[] = [];

  for (const [, { displayName: vendor, items }] of vendorGroups.entries()) {
    const vendorSlug = getArtistSlug(vendor);
    const packageId = `${orderId}-${vendorSlug}`;
    const artistProfile = getArtistBySlug(vendorSlug, vendor);
    const artistAvatar = artistProfile.avatar || "/assets/blank_seoul_symbol.png";

    // Resolve artisan-specific status using exact name, trimmed name, and normalized slug
    const artistRawStatus =
      artistStatusMap[vendor.toLowerCase().trim()] ||
      artistStatusMap[vendorSlug] ||
      "";

    const matched = (fulfillments || []).filter(f => f.status === 'success' && f.line_items?.some(line =>
      items.some(item => item.variantId === `gid://shopify/ProductVariant/${line.variant_id}`)));
    const shippedQuantities = new Map<string, number>();
    for (const fulfillment of matched) for (const line of fulfillment.line_items || []) {
      const id = `gid://shopify/ProductVariant/${line.variant_id}`;
      shippedQuantities.set(id, (shippedQuantities.get(id) || 0) + line.quantity);
    }
    const required = new Map<string, number>();
    for (const item of items) {
      const key = item.variantId || 'unknown';
      required.set(key, (required.get(key) || 0) + item.quantity);
    }
    const fullyShipped = [...required].every(([id, quantity]) => (shippedQuantities.get(id) || 0) >= quantity);
    const fullyDelivered = fullyShipped && matched.every(f => f.shipment_status === 'delivered');
    const wmsStatus = fullyDelivered || orderWmsStatus === 'delivered'
      ? 'delivered'
      : fullyShipped || orderFulfillmentStatus === 'FULFILLED' || orderWmsStatus === 'shipped'
        ? 'shipped'
        : aggregateWmsStatus('', artistRawStatus ? [artistRawStatus] : [], null);
    const { step } = getOrderStep(orderFulfillmentStatus || '', wmsStatus);

    // Never attach another maker's tracking to an unfulfilled group.
    const shipment = matched.find(f => f.tracking_number);
    const canUseOrderTracking = orderFulfillmentStatus === 'FULFILLED' || ['shipped', 'delivered'].includes(orderWmsStatus || '');
    const source = shipment ? {
      number: shipment.tracking_number, company: shipment.tracking_company, url: shipment.tracking_url,
    } : canUseOrderTracking ? orderTracking : null;
    const tracking = source?.number && ['shipped', 'delivered'].includes(wmsStatus) ? {
      number: source.number, company: source.company || 'Korea Post',
      url: getCarrierTrackingUrl(source.number, source.company) || source.url || null,
    } : null;

    packages.push({
      packageId,
      vendor,
      vendorSlug,
      artistAvatar,
      items,
      step,
      wmsStatus,
      tracking,
      deliveredAt: wmsStatus === "delivered" ? deliveredAt : null,
    });
  }

  return packages;
}
