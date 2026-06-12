-- ============================================================
-- Migration 005: Add 3rd place support to Lite predictions
-- ============================================================

-- 1. Add team3_id to group_predictions_lite
ALTER TABLE group_predictions_lite ADD COLUMN IF NOT EXISTS team3_id UUID REFERENCES teams(id);

-- 2. Drop the old check constraint on group_qualifiers if it exists
ALTER TABLE group_qualifiers DROP CONSTRAINT IF EXISTS group_qualifiers_position_check;

-- 3. Add the updated check constraint on group_qualifiers to allow 3rd place
ALTER TABLE group_qualifiers ADD CONSTRAINT group_qualifiers_position_check CHECK (position IN (1, 2, 3));
