import { queryOne } from './config/db';

async function check() {
  const team = await queryOne('SELECT id, name, code, external_id FROM teams WHERE id = $1', ['f1ddeb3-45ff-4da9-adba-d02722e1bfa9']);
  console.log(JSON.stringify(team, null, 2));
  process.exit(0);
}
check();
