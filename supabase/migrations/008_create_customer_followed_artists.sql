-- =============================================
-- Customer Followed Artists Table
-- Supabase Auth 기반 고객별 공방/작가 팔로우 목록
-- =============================================

CREATE TABLE IF NOT EXISTS customer_followed_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_slug TEXT NOT NULL CHECK (artist_slug = lower(trim(artist_slug)) AND length(artist_slug) > 0),
  artist_name TEXT NOT NULL DEFAULT '',
  notify_drops BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, artist_slug)
);

-- 인덱스 최적화:
-- 1. user_id 인덱스는 UNIQUE(user_id, artist_slug) 복합 인덱스의 최좌측 접두사로 100% 커버 (중복 제거로 쓰기 IOPS 절감)
-- 2. 드롭 알림 마케팅 타겟 추출을 위한 초고속 복합 인덱스 (Index-Only Scan 지원)
CREATE INDEX IF NOT EXISTS idx_customer_followed_artists_slug_notify 
  ON customer_followed_artists(artist_slug, notify_drops);

-- RLS: 본인 데이터만 접근/수정 가능
ALTER TABLE customer_followed_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage own followed artists"
  ON customer_followed_artists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
