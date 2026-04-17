// Supabase DB types for storefront tables

export interface StorefrontCustomer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  shopify_customer_id: string | null;
  shopify_access_token: string | null;
  shopify_token_expires_at: string | null;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CancelRequest {
  id: string;
  customer_id: string;
  customer_email: string;
  shopify_order_id: string;
  order_number: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  requested_at: string;
  processed_at: string | null;
}
