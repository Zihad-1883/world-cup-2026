import dotenv from 'dotenv';
dotenv.config();

async function checkIvoryCoast() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const response = await fetch(
    'https://api.football-data.org/v4/teams/1935',
    { headers: { 'X-Auth-Token': apiKey! } }
  );
  const data = await response.json();
  // Add "as any" right after data to bypass the strict unknown check
  console.log('Ivory Coast Squad Keys:', Object.keys((data as any).squad[0]));
  console.log('Sample Squad Member Data:', JSON.stringify((data as any).squad[0], null, 2));
  process.exit(0);
}
checkIvoryCoast();
