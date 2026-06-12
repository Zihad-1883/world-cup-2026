require('dotenv').config();

async function checkKorea() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const url = 'https://api.football-data.org/v4/competitions/WC/matches?season=2026';
  
  try {
    const response = await fetch(url, { headers: { 'X-Auth-Token': apiKey } });
    const data = await response.json();
    const match = data.matches.find(m => m.homeTeam.tla === 'KOR' || m.awayTeam.tla === 'KOR');
    console.log(JSON.stringify(match, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

checkKorea();
