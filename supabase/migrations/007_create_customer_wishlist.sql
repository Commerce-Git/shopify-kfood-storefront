-- =============================================
-- Customer Wishlist Table
-- Supabase Auth 기반 고객별 찜(좋아요) 목록
-- user_id는 auth.users.id와 연결 (FK)
-- =============================================

CREATE TABLE IF NOT EXISTS customer_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_handle TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_handle)
);

-- 인덱스 생성 (초고속 조회 보장)
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_user_id ON customer_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_product_handle ON customer_wishlist(product_handle);

-- RLS: 본인 데이터만 접근/수정 가능
ALTER TABLE customer_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage own wishlist"
  ON customer_wishlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
