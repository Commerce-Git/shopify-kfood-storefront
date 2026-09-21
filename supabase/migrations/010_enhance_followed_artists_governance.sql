-- ==========================================================
-- 010_enhance_followed_artists_governance.sql
-- Soft Churn Data Governance & High-Performance Drop View
-- ==========================================================

-- 1. 소프트 언팔로우(Soft Churn) 및 감사 추적(Audit Trail) 컬럼 추가
ALTER TABLE customer_followed_artists 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL 
  CHECK (status IN ('active', 'unsubscribed'));

ALTER TABLE customer_followed_artists 
  ADD COLUMN IF NOT EXISTS unfollowed_at TIMESTAMPTZ;

-- 기존 레코드 데이터 보정 (NULL 방지)
UPDATE customer_followed_artists 
SET status = 'active' 
WHERE status IS NULL;

-- 2. 고속 타겟팅 복합 인덱스 신설
CREATE INDEX IF NOT EXISTS idx_customer_followed_artists_status_slug 
  ON customer_followed_artists(artist_slug, status, notify_drops);

-- 3. 초고속 신작 드롭 발송 대상자 인덱스 뷰 (active_artist_drop_subscribers)
-- 법적 마케팅 수신 동의(storefront_customers.marketing_consent = true)와
-- 활성 팔로우(status = 'active', notify_drops = true)가 동시에 충족된 대상만 즉시 추출
CREATE OR REPLACE VIEW active_artist_drop_subscribers AS
SELECT 
  f.artist_slug,
  f.artist_name,
  c.email,
  c.first_name,
  c.last_name,
  f.user_id,
  f.created_at AS followed_at
FROM customer_followed_artists f
INNER JOIN storefront_customers c ON f.user_id = c.id
WHERE f.status = 'active'
  AND f.notify_drops = true
  AND c.marketing_consent = true;

-- 4. 뷰 주석 및 설명
COMMENT ON VIEW active_artist_drop_subscribers IS 
  'First-party SSOT view for targeted artist drop email broadcasts with marketing consent governance.';
