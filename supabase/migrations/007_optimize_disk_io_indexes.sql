-- =============================================
-- Disk IO Protection: Composite Index for Reviews
-- Prevents Full Table Scans (Read IOPS exhaustion) on Product Pages & Review API
-- =============================================

CREATE INDEX IF NOT EXISTS idx_reviews_status_submitted 
  ON reviews (status, submitted_at DESC);
