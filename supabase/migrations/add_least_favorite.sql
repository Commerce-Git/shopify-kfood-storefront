-- Run this in Supabase SQL Editor to add the new column
-- for the "Least favorite snacks" question.

ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS least_favorite_snacks TEXT[] DEFAULT '{}';
