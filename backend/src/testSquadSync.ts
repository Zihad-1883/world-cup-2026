import { syncTeamSquad } from './services/syncService';
import { queryOne } from './config/db';
import dotenv from 'dotenv';
dotenv.config();

async function testSync() {
  const team = await queryOne<{ id: string }>('SELECT id FROM teams WHERE name = $1', ['Côte d\'Ivoire']);
  if (!team) { console.log('Team not found'); process.exit(1); }
  
  const res = await syncTeamSquad(team.id);
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
testSync();
