import { syncAllTeams } from './services/syncService';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const res = await syncAllTeams();
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
run();
