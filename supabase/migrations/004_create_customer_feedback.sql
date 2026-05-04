-- =============================================
-- Customer Feedback Table
-- Contact Us 등 고객 피드백 저장
-- =============================================

CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  content TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- No RLS — accessed only via Service Role Key from server-side API route
