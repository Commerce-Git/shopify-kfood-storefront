/**
 * Map Shopify fulfillment status to a display-friendly step number (0-3).
 */
export function getOrderStep(
  fulfillmentStatus: string,
  wmsStatus?: string
): { step: number; label: string } {
  if (wmsStatus) {
    switch (wmsStatus) {
      case "shipped":
        return { step: 3, label: "Shipped" };
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
      return { step: 3, label: "Shipped" };
    default:
      return { step: 0, label: "Order Placed" };
  }
}
