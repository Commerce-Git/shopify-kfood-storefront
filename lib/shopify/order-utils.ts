/**
 * Map order status to a display-friendly step number (0-4).
 *
 * 5-Stage Delivery Pipeline:
 *  0: Ordered    📝  (주문 접수)
 *  1: Crafting   🎨  (수제작 중)
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
        return { step: 1, label: "Crafting" };
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

    let wmsStatus: "placed" | "crafting" | "packaging" | "shipped" | "delivered" = "placed";

    if (artistRawStatus === "delivered" || orderWmsStatus === "delivered") {
      wmsStatus = "delivered";
    } else if (artistRawStatus === "shipped" || orderFulfillmentStatus === "FULFILLED") {
      wmsStatus = "shipped";
    } else if (artistRawStatus === "received") {
      wmsStatus = "packaging";
    } else if (artistRawStatus === "confirmed") {
      wmsStatus = "crafting";
    } else if (orderWmsStatus === "placed" || orderWmsStatus === "crafting" || orderWmsStatus === "packaging" || orderWmsStatus === "shipped") {
      wmsStatus = orderWmsStatus;
    }

    const { step } = getOrderStep(orderFulfillmentStatus || "", wmsStatus);

    // Multi-fulfillment matching: Check if any fulfillment in Shopify specifically contains this package's variant IDs
    let tracking = null;
    if (fulfillments && fulfillments.length > 0) {
      const packageVariantIds = new Set(
        items
          .map((it) => (it.variantId ? String(it.variantId).replace(/\D/g, "") : null))
          .filter(Boolean)
      );

      const matchedFulfillment = fulfillments.find((f) =>
        f.line_items?.some((fl) => fl.variant_id && packageVariantIds.has(String(fl.variant_id).replace(/\D/g, "")))
      );

      if (matchedFulfillment?.tracking_number && (wmsStatus === "shipped" || wmsStatus === "delivered")) {
        tracking = {
          number: matchedFulfillment.tracking_number,
          company: matchedFulfillment.tracking_company || "Korea Post EMS",
          url:
            getCarrierTrackingUrl(matchedFulfillment.tracking_number, matchedFulfillment.tracking_company) ||
            matchedFulfillment.tracking_url ||
            null,
        };
      }
    }

    // Fallback to order-level tracking
    if (!tracking && orderTracking?.number && (wmsStatus === "shipped" || wmsStatus === "delivered")) {
      tracking = {
        number: orderTracking.number,
        company: orderTracking.company || "Korea Post EMS",
        url: getCarrierTrackingUrl(orderTracking.number, orderTracking.company) || orderTracking.url || null,
      };
    }

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
