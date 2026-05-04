/**
 * Map Shopify fulfillment status to a display-friendly step number (0-3).
 */
export function getOrderStep(
  fulfillmentStatus: string
): { step: number; label: string } {
  switch (fulfillmentStatus) {
    case "FULFILLED":
      return { step: 1, label: "Shipped" };
    case "UNFULFILLED":
    case "IN_PROGRESS":
    case "PARTIALLY_FULFILLED":
    default:
      return { step: 0, label: "Order Placed" };
  }
}
