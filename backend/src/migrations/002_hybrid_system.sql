-- ============================================================
-- Migration 002: Hybrid Prediction System
-- ============================================================

-- 1. Add prediction mode to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS prediction_mode VARCHAR(10) DEFAULT 'LITE' 
  CHECK (prediction_mode IN ('LITE', 'PRO', 'HYBRID'));

-- 2. Group predictions (LITE mode: 2 teams per group)
CREATE TABLE IF NOT EXISTS group_predictions_lite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_name VARCHAR(2) NOT NULL,
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, group_name)
);

-- 3. Points Log (Detailed history of points per mode)
CREATE TABLE IF NOT EXISTS user_points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mode VARCHAR(10) CHECK (mode IN ('LITE', 'PRO')),
  points INTEGER NOT NULL,
  round VARCHAR(20),
  source_id UUID, -- References either group_predictions_lite.id or predictions.id
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Actual Group Qualifiers (Set by admin)
CREATE TABLE IF NOT EXISTS group_qualifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(2) NOT NULL,
  team_id UUID REFERENCES teams(id),
  position INTEGER CHECK (position IN (1, 2)), -- 1st or 2nd place
  qualified BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_name, position)
);

-- Note: We continue to use the existing 'predictions' table for individual match picks (PRO mode).
