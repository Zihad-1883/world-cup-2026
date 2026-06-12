require('dotenv').config();

async function checkWC() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const url = 'https://api.football-data.org/v4/competitions/WC/matches?season=2026';
  
  try {
    const response = await fetch(url, { headers: { 'X-Auth-Token': apiKey } });
    console.log('HTTP Status:', response.status);
    const data = await response.json();
    if (!response.ok) {
        console.error('API Error Response:', JSON.stringify(data, null, 2));
    } else {
        console.log('Success!');
        console.log('Competition:', data.competition ? data.competition.name : 'Unknown');
        console.log('Match Count:', data.matches ? data.matches.length : 0);
        if (data.matches && data.matches.length > 0) {
            console.log('First Match ID:', data.matches[0].id);
            console.log('First Match Status:', data.matches[0].status);
        }
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

checkWC();
