import { query } from './config/db';

async function list() {
  const rows = await query("SELECT id, name FROM teams WHERE name IN ('Mexico', 'South Africa')");
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
list();
