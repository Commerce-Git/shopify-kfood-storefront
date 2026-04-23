-- Shopify Admin API 토큰 캐싱 테이블
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS shopify_token_cache (
  id TEXT PRIMARY KEY DEFAULT 'admin_token',
  access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화 — service_role 키만 접근 가능 (일반 사용자 접근 차단)
ALTER TABLE shopify_token_cache ENABLE ROW LEVEL SECURITY;

-- 정책 없음 = anon/authenticated 키로는 접근 불가
-- service_role 키는 RLS를 bypass하므로 서버에서만 읽기/쓰기 가능
