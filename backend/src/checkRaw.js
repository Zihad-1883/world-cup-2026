require('dotenv').config();

async function check() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const response = await fetch(
    'https://api.football-data.org/v4/teams/1935',
    { headers: { 'X-Auth-Token': apiKey } }
  );
  const data = await response.json();
  console.log('Sample Member:', data.squad[0]);
  process.exit(0);
}
check();
