import { query } from './config/db';

async function migrate() {
  await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS external_id VARCHAR(50)');
  console.log('Added external_id to teams');
  process.exit(0);
}
migrate();
