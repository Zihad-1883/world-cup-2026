import dotenv from 'dotenv';
dotenv.config();

async function checkPerson() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const response = await fetch(
    'https://api.football-data.org/v4/persons/616',
    { headers: { 'X-Auth-Token': apiKey! } }
  );
  if (!response.ok) {
    console.log('Error:', response.status);
    return;
  }
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}
checkPerson();
