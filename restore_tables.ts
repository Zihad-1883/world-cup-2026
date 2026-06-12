import { query } from './backend/src/config/db.ts';

async function restore() {
  console.log('Restoring dropped tables...');
  try {
    // 1. predictions table
    await query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        predicted_winner_id UUID REFERENCES teams(id),
        is_correct BOOLEAN,
        points_earned NUMERIC(10, 2) DEFAULT 0,
        predicted_slot INTEGER CHECK (predicted_slot IN (1, 2)),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, match_id)
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id)');

    // 2. group_predictions_lite table
    await query(`
      CREATE TABLE IF NOT EXISTS group_predictions_lite (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        group_name VARCHAR(2) NOT NULL,
        team1_id UUID REFERENCES teams(id),
        team2_id UUID REFERENCES teams(id),
        team3_id UUID REFERENCES teams(id),
        points_earned NUMERIC(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, group_name)
      )
    `);

    // 3. user_points_log table
    await query(`
      CREATE TABLE IF NOT EXISTS user_points_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        mode VARCHAR(10) CHECK (mode IN ('LITE', 'PRO')),
        points NUMERIC(10, 2) NOT NULL,
        round VARCHAR(20),
        source_id UUID,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 4. group_qualifiers table
    await query(`
      CREATE TABLE IF NOT EXISTS group_qualifiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_name VARCHAR(2) NOT NULL,
        team_id UUID REFERENCES teams(id),
        position INTEGER CHECK (position IN (1, 2, 3)),
        qualified BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(group_name, position)
      )
    `);

    console.log('✅ Tables restored successfully.');
  } catch (err) {
    console.error('❌ Error restoring tables:', err);
  }
}

restore();
