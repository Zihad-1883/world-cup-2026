import { query } from '../config/db';
import dotenv from 'dotenv';
dotenv.config();

interface fdMatch {
  id: number;
  utcDate: string;
  homeTeam: { tla: string; name: string };
  awayTeam: { tla: string; name: string };
}

async function linkMatchesByTeams() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    console.error('FOOTBALL_DATA_API_KEY not found');
    process.exit(1);
  }

  console.log('Fetching matches from football-data.org...');
  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    { headers: { 'X-Auth-Token': apiKey } }
  );

  if (!response.ok) {
    console.error(`API Error: ${response.status}`);
    process.exit(1);
  }

  const data = await response.json() as { matches: fdMatch[] };
  
  // Get all our teams to map codes
  const teamRows = await query<{ id: string, code: string }>('SELECT id, code FROM teams');
  const teamMap: Record<string, string> = {};
  teamRows.forEach(row => teamMap[row.code] = row.id);

  let linked = 0;
  for (const fdm of data.matches) {
    const t1Code = fdm.homeTeam.tla;
    const t2Code = fdm.awayTeam.tla;
    
    if (!t1Code || !t2Code) continue;

    const t1Id = teamMap[t1Code];
    const t2Id = teamMap[t2Code];

    if (!t1Id || !t2Id) continue;

    // Find match by team IDs and round/kickoff?
    // Kickoff is more reliable if dates match.
    // Wait, let's try to match by team IDs AND kickoff_time.
    
    const res = await query(
      `UPDATE matches 
       SET external_id = $1 
       WHERE team1_id = $2 AND team2_id = $3 AND external_id IS NULL 
       RETURNING id`,
      [String(fdm.id), t1Id, t2Id]
    );

    if (res.length > 0) {
      linked++;
    }
  }

  console.log(`Successfully linked ${linked} more matches by team teams.`);
  process.exit(0);
}

linkMatchesByTeams();
