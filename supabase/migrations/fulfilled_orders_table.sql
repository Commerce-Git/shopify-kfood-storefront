CREATE TABLE IF NOT EXISTS fulfilled_orders (
  order_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  fulfilled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback_requested BOOLEAN DEFAULT FALSE
);

-- RLS 정책 설정 (서버 API만 접근 가능하도록 차단)
ALTER TABLE fulfilled_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage fulfilled orders"
  ON fulfilled_orders
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
