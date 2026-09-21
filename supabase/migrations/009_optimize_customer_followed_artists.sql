-- ==========================================================
-- 009_optimize_customer_followed_artists.sql
-- Customer Followed Artists Schema & Index Optimization
-- ==========================================================

-- 1. 중복 인덱스 정리 (디스크 쓰기 IOPS 절감)
DROP INDEX IF EXISTS idx_customer_followed_artists_user_id;
DROP INDEX IF EXISTS idx_customer_followed_artists_slug;

-- 2. 마케팅 최적화 복합 인덱스 신설 (Index-Only Scan)
CREATE INDEX IF NOT EXISTS idx_customer_followed_artists_slug_notify 
  ON customer_followed_artists(artist_slug, notify_drops);

-- 3. 이력 추적용 updated_at 컬럼 추가
ALTER TABLE customer_followed_artists 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;

-- 4. 슬러그 무결성 체크 제약조건 추가
ALTER TABLE customer_followed_artists 
  DROP CONSTRAINT IF EXISTS check_artist_slug_format;

ALTER TABLE customer_followed_artists 
  ADD CONSTRAINT check_artist_slug_format 
  CHECK (artist_slug = lower(trim(artist_slug)) AND length(artist_slug) > 0);
