import { query } from '../config/db';
import dotenv from 'dotenv';
dotenv.config();

interface fdMatch {
  id: number;
  utcDate: string;
}

async function linkMatches() {
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
  console.log(`Found ${data.matches.length} matches from API.`);

  let linked = 0;
  for (const fdm of data.matches) {
    const kickoff = fdm.utcDate; // ISO string like '2026-06-11T19:00:00Z'
    
    // Attempt to match by kickoff time (since it's a unique timestamp in our seed)
    // and round/stage if needed, but kickoff_time should be enough combined with team IDs later if needed.
    // However, let's just use kickoff_time for now.
    
    const res = await query(
      'UPDATE matches SET external_id = $1 WHERE kickoff_time = $2 AND external_id IS NULL RETURNING id',
      [String(fdm.id), kickoff]
    );

    if (res.length > 0) {
      linked++;
    }
  }

  console.log(`Successfully linked ${linked} matches with external IDs.`);
  process.exit(0);
}

linkMatches();
