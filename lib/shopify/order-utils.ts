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
