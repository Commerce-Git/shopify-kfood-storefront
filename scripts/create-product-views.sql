-- 상품 조회수 집계 테이블 (Product Views Counter)
-- Supabase Dashboard → SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS product_views (
  product_handle TEXT PRIMARY KEY,
  view_count INTEGER DEFAULT 1,
  last_viewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- 공용 조회(SELECT) 허용 정책
CREATE POLICY "Allow public read on product_views" 
  ON product_views FOR SELECT 
  TO anon, authenticated 
  USING (true);
