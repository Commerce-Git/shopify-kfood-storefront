-- =============================================
-- Email Opt-Out Table
-- 이메일 수신 거부 목록
-- =============================================

CREATE TABLE IF NOT EXISTS email_opt_out (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  opted_out_at TIMESTAMPTZ DEFAULT now()
);

-- No RLS — accessed only via Service Role Key from server-side
