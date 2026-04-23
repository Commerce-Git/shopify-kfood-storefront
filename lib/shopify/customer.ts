import { storefrontFetch } from "./storefront";
import { GET_CUSTOMER_ORDERS } from "./customer-queries";

// ---- Types ----

export interface ShopifyOrder {
  id: string;
  name: string; // "#1001"
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  statusUrl: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: {
          price: { amount: string; currencyCode: string };
          image: { url: string; altText: string | null } | null;
        } | null;
      };
    }[];
  };
}

interface CustomerOrdersResponse {
  customer: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    orders: {
      edges: { node: ShopifyOrder }[];
    };
  } | null;
}

// ---- API Functions ----

/**
 * Fetch customer orders from Shopify Storefront API.
 * Requires a Shopify customer access token.
 */
export async function getCustomerOrders(
  accessToken: string
): Promise<ShopifyOrder[]> {
  try {
    const data = await storefrontFetch<CustomerOrdersResponse>(
      GET_CUSTOMER_ORDERS,
      { customerAccessToken: accessToken }
    );

    if (!data.customer) {
      return [];
    }

    return data.customer.orders.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("[getCustomerOrders]", error);
    return [];
  }
}

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
