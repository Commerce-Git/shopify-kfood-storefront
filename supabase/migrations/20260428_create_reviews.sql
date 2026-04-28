-- =============================================
-- Reviews 테이블 생성
-- 리뷰 + 피드백 + 쿠폰 데이터를 통합 관리합니다
-- =============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 리뷰 접근 토큰 (이메일 링크용)
  token TEXT UNIQUE NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,

  -- Shopify 주문 정보
  order_id TEXT NOT NULL,
  order_name TEXT NOT NULL,

  -- 고객 정보
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  -- 공개 리뷰 데이터 (상품 페이지에 노출)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  photo_urls TEXT[] DEFAULT '{}',

  -- 비공개 피드백 데이터 (대표님만 확인)
  favorite_snacks TEXT[] DEFAULT '{}',
  least_favorite_snacks TEXT[] DEFAULT '{}',
  want_next TEXT[] DEFAULT '{}',
  private_comment TEXT,

  -- 리뷰 상태
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),

  -- 쿠폰 정보
  coupon_code TEXT UNIQUE,
  coupon_expires_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- 인덱스: 승인된 리뷰 조회 (상품 페이지용)
CREATE INDEX idx_reviews_approved ON reviews (status, submitted_at DESC)
  WHERE rating IS NOT NULL AND status = 'approved';

-- 인덱스: 쿠폰 만료 리마인더 크론잡용
CREATE INDEX idx_reviews_coupon_reminder ON reviews (coupon_expires_at, reminder_sent)
  WHERE coupon_code IS NOT NULL AND reminder_sent = FALSE;

-- 인덱스: 토큰 조회
CREATE INDEX idx_reviews_token ON reviews (token);

-- RLS (Row Level Security) 활성화
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 공개 리뷰 조회 정책 (anon 키로 승인된 리뷰만 읽기 가능)
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (rating IS NOT NULL AND status = 'approved');

-- service_role은 모든 작업 허용 (API에서 사용)
CREATE POLICY "Service role has full access"
  ON reviews
  USING (TRUE)
  WITH CHECK (TRUE);
