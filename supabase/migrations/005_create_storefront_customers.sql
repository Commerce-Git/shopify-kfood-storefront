-- =============================================
-- Storefront Customers Table
-- Supabase Auth 기반 고객 프로필
-- id는 auth.users의 UUID와 동일 (FK)
-- =============================================

CREATE TABLE IF NOT EXISTS storefront_customers (
  id UUID PRIMARY KEY,  -- matches auth.users.id
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  shopify_customer_id TEXT,
  shopify_access_token TEXT,
  shopify_token_expires_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: 본인 데이터만 접근 가능
ALTER TABLE storefront_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_own_data"
  ON storefront_customers FOR ALL
  USING (auth.uid() = id);
