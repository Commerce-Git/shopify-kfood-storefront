-- =============================================
-- Reviews Table
-- 리뷰 + 쿠폰 통합 테이블 (리뷰-쿠폰 선순환 시스템)
-- =============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  order_id TEXT NOT NULL,
  order_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER,
  title TEXT,
  body TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  favorite_snacks TEXT[] DEFAULT '{}',
  least_favorite_snacks TEXT[] DEFAULT '{}',
  want_next TEXT[] DEFAULT '{}',
  private_comment TEXT,
  status TEXT DEFAULT 'approved',
  coupon_code TEXT,
  coupon_expires_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (rating IS NOT NULL AND status = 'approved');

CREATE POLICY "Service role has full access"
  ON reviews FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_customer_email ON reviews (customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_coupon_code ON reviews (coupon_code);
CREATE INDEX IF NOT EXISTS idx_reviews_token ON reviews (token);
