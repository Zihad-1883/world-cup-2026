-- Ensure total_points exists on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points NUMERIC(10, 2) DEFAULT 0;

-- Change points columns from INTEGER to NUMERIC to support 0.5 points
ALTER TABLE group_predictions_lite ALTER COLUMN points_earned TYPE NUMERIC(10, 2);
ALTER TABLE user_points_log ALTER COLUMN points TYPE NUMERIC(10, 2);
ALTER TABLE predictions ALTER COLUMN points_earned TYPE NUMERIC(10, 2);
