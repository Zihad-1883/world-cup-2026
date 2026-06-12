-- Add predicted_slot to support bracket predictions before teams are resolved
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS predicted_slot INTEGER CHECK (predicted_slot IN (1, 2));
