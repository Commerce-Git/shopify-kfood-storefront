-- =============================================
-- Storefront Cancel Requests Table
-- 주문 취소 요청 이력
-- =============================================

CREATE TABLE IF NOT EXISTS storefront_cancel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  customer_email TEXT NOT NULL,
  shopify_order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',  -- pending | approved | rejected | failed
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- RLS: 본인 요청만 접근 가능
ALTER TABLE storefront_cancel_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cancel_own_requests"
  ON storefront_cancel_requests FOR ALL
  USING (auth.uid() = customer_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cancel_requests_order ON storefront_cancel_requests (shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_cancel_requests_customer ON storefront_cancel_requests (customer_id);
