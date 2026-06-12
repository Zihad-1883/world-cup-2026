require('dotenv').config();

async function check() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  // Messi's ID is 753
  const response = await fetch(
    'https://api.football-data.org/v4/persons/753',
    { headers: { 'X-Auth-Token': apiKey } }
  );
  const data = await response.json();
  console.log('Messi Personal Info:', data);
  process.exit(0);
}
check();
