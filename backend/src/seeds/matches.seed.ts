import 'dotenv/config';
import { pool } from '../config/db';

// PT to UTC: +7 hours
function ptToUtc(dateStr: string, timeStr: string): string {
  const year = 2026;
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const [monthStr, dayStr] = dateStr.split(' ');
  const month = months[monthStr];
  const day = parseInt(dayStr, 10);
  const isPM = timeStr.endsWith('PM');
  const timePart = timeStr.replace('PM', '').replace('AM', '');
  const [hoursStr, minsStr] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const mins = parseInt(minsStr, 10);
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  const ptDate = new Date(Date.UTC(year, month, day, hours, mins, 0));
  ptDate.setUTCHours(ptDate.getUTCHours() + 7);
  return ptDate.toISOString();
}

interface MatchSeed { num: number; date: string; time: string; team1: string; team2: string; venue: string; city: string; }

const groupMatches: MatchSeed[] = [
  { num:  1, date: 'Jun 11', time: '12:00PM', team1: 'MEX', team2: 'RSA', venue: 'Estadio Azteca',            city: 'Mexico City' },
  { num:  2, date: 'Jun 11', time: '7:00PM',  team1: 'KOR', team2: 'CZE', venue: 'Estadio Akron',             city: 'Guadalajara' },
  { num:  3, date: 'Jun 12', time: '12:00PM', team1: 'CAN', team2: 'BIH', venue: 'BMO Field',                 city: 'Toronto' },
  { num:  4, date: 'Jun 12', time: '6:00PM',  team1: 'USA', team2: 'PAR', venue: 'SoFi Stadium',              city: 'Inglewood' },
  { num:  5, date: 'Jun 13', time: '12:00PM', team1: 'QAT', team2: 'SUI', venue: "Levi's Stadium",            city: 'Santa Clara' },
  { num:  6, date: 'Jun 13', time: '3:00PM',  team1: 'BRA', team2: 'MAR', venue: 'MetLife Stadium',           city: 'East Rutherford' },
  { num:  7, date: 'Jun 13', time: '6:00PM',  team1: 'HAI', team2: 'SCO', venue: 'Gillette Stadium',          city: 'Foxborough' },
  { num:  8, date: 'Jun 13', time: '9:00PM',  team1: 'AUS', team2: 'TUR', venue: 'BC Place',                  city: 'Vancouver' },
  { num:  9, date: 'Jun 14', time: '10:00AM', team1: 'GER', team2: 'CUW', venue: 'NRG Stadium',               city: 'Houston' },
  { num: 10, date: 'Jun 14', time: '1:00PM',  team1: 'NED', team2: 'JPN', venue: 'AT&T Stadium',              city: 'Arlington' },
  { num: 11, date: 'Jun 14', time: '4:00PM',  team1: 'CIV', team2: 'ECU', venue: 'Lincoln Financial Field',   city: 'Philadelphia' },
  { num: 12, date: 'Jun 14', time: '7:00PM',  team1: 'SWE', team2: 'TUN', venue: 'Estadio BBVA Bancomer',     city: 'Monterrey' },
  { num: 13, date: 'Jun 15', time: '9:00AM',  team1: 'ESP', team2: 'CPV', venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  { num: 14, date: 'Jun 15', time: '12:00PM', team1: 'BEL', team2: 'EGY', venue: 'Lumen Field',               city: 'Seattle' },
  { num: 15, date: 'Jun 15', time: '3:00PM',  team1: 'KSA', team2: 'URU', venue: 'Hard Rock Stadium',         city: 'Miami' },
  { num: 16, date: 'Jun 15', time: '6:00PM',  team1: 'IRN', team2: 'NZL', venue: 'SoFi Stadium',              city: 'Inglewood' },
  { num: 17, date: 'Jun 16', time: '12:00PM', team1: 'FRA', team2: 'SEN', venue: 'MetLife Stadium',           city: 'East Rutherford' },
  { num: 18, date: 'Jun 16', time: '3:00PM',  team1: 'IRQ', team2: 'NOR', venue: 'Gillette Stadium',          city: 'Foxborough' },
  { num: 19, date: 'Jun 16', time: '6:00PM',  team1: 'ARG', team2: 'ALG', venue: 'Arrowhead Stadium',         city: 'Kansas City' },
  { num: 20, date: 'Jun 16', time: '9:00PM',  team1: 'AUT', team2: 'JOR', venue: "Levi's Stadium",            city: 'Santa Clara' },
  { num: 21, date: 'Jun 17', time: '10:00AM', team1: 'POR', team2: 'COD', venue: 'NRG Stadium',               city: 'Houston' },
  { num: 22, date: 'Jun 17', time: '1:00PM',  team1: 'ENG', team2: 'CRO', venue: 'AT&T Stadium',              city: 'Arlington' },
  { num: 23, date: 'Jun 17', time: '4:00PM',  team1: 'GHA', team2: 'PAN', venue: 'BMO Field',                 city: 'Toronto' },
  { num: 24, date: 'Jun 17', time: '7:00PM',  team1: 'UZB', team2: 'COL', venue: 'Estadio Azteca',            city: 'Mexico City' },
  { num: 25, date: 'Jun 18', time: '9:00AM',  team1: 'CZE', team2: 'RSA', venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  { num: 26, date: 'Jun 18', time: '12:00PM', team1: 'SUI', team2: 'BIH', venue: 'SoFi Stadium',              city: 'Inglewood' },
  { num: 27, date: 'Jun 18', time: '3:00PM',  team1: 'CAN', team2: 'QAT', venue: 'BC Place',                  city: 'Vancouver' },
  { num: 28, date: 'Jun 18', time: '6:00PM',  team1: 'MEX', team2: 'KOR', venue: 'Estadio Akron',             city: 'Guadalajara' },
  { num: 29, date: 'Jun 19', time: '12:00PM', team1: 'USA', team2: 'AUS', venue: 'Lumen Field',               city: 'Seattle' },
  { num: 30, date: 'Jun 19', time: '3:00PM',  team1: 'SCO', team2: 'MAR', venue: 'Gillette Stadium',          city: 'Foxborough' },
  { num: 31, date: 'Jun 19', time: '6:30PM',  team1: 'BRA', team2: 'HAI', venue: 'Lincoln Financial Field',   city: 'Philadelphia' },
  { num: 32, date: 'Jun 19', time: '8:00PM',  team1: 'TUR', team2: 'PAR', venue: "Levi's Stadium",            city: 'Santa Clara' },
  { num: 33, date: 'Jun 20', time: '10:00AM', team1: 'NED', team2: 'SWE', venue: 'NRG Stadium',               city: 'Houston' },
  { num: 34, date: 'Jun 20', time: '1:00PM',  team1: 'GER', team2: 'CIV', venue: 'BMO Field',                 city: 'Toronto' },
  { num: 35, date: 'Jun 20', time: '5:00PM',  team1: 'ECU', team2: 'CUW', venue: 'Arrowhead Stadium',         city: 'Kansas City' },
  { num: 36, date: 'Jun 20', time: '9:00PM',  team1: 'TUN', team2: 'JPN', venue: 'Estadio BBVA Bancomer',     city: 'Monterrey' },
  { num: 37, date: 'Jun 21', time: '9:00AM',  team1: 'ESP', team2: 'KSA', venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  { num: 38, date: 'Jun 21', time: '12:00PM', team1: 'BEL', team2: 'IRN', venue: 'SoFi Stadium',              city: 'Inglewood' },
  { num: 39, date: 'Jun 21', time: '3:00PM',  team1: 'URU', team2: 'CPV', venue: 'Hard Rock Stadium',         city: 'Miami' },
  { num: 40, date: 'Jun 21', time: '6:00PM',  team1: 'NZL', team2: 'EGY', venue: 'BC Place',                  city: 'Vancouver' },
  { num: 41, date: 'Jun 22', time: '10:00AM', team1: 'ARG', team2: 'AUT', venue: 'AT&T Stadium',              city: 'Arlington' },
  { num: 42, date: 'Jun 22', time: '2:00PM',  team1: 'FRA', team2: 'IRQ', venue: 'Lincoln Financial Field',   city: 'Philadelphia' },
  { num: 43, date: 'Jun 22', time: '5:00PM',  team1: 'NOR', team2: 'SEN', venue: 'MetLife Stadium',           city: 'East Rutherford' },
  { num: 44, date: 'Jun 22', time: '8:00PM',  team1: 'JOR', team2: 'ALG', venue: "Levi's Stadium",            city: 'Santa Clara' },
  { num: 45, date: 'Jun 23', time: '10:00AM', team1: 'POR', team2: 'UZB', venue: 'NRG Stadium',               city: 'Houston' },
  { num: 46, date: 'Jun 23', time: '1:00PM',  team1: 'ENG', team2: 'GHA', venue: 'Gillette Stadium',          city: 'Foxborough' },
  { num: 47, date: 'Jun 23', time: '4:00PM',  team1: 'PAN', team2: 'CRO', venue: 'BMO Field',                 city: 'Toronto' },
  { num: 48, date: 'Jun 23', time: '7:00PM',  team1: 'COL', team2: 'COD', venue: 'Estadio Akron',             city: 'Guadalajara' },
  { num: 49, date: 'Jun 24', time: '12:00PM', team1: 'SUI', team2: 'CAN', venue: 'BC Place',                  city: 'Vancouver' },
  { num: 50, date: 'Jun 24', time: '12:00PM', team1: 'BIH', team2: 'QAT', venue: 'Lumen Field',               city: 'Seattle' },
  { num: 51, date: 'Jun 24', time: '3:00PM',  team1: 'SCO', team2: 'BRA', venue: 'Hard Rock Stadium',         city: 'Miami' },
  { num: 52, date: 'Jun 24', time: '3:00PM',  team1: 'MAR', team2: 'HAI', venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  { num: 53, date: 'Jun 24', time: '6:00PM',  team1: 'CZE', team2: 'MEX', venue: 'Estadio Azteca',            city: 'Mexico City' },
  { num: 54, date: 'Jun 24', time: '6:00PM',  team1: 'RSA', team2: 'KOR', venue: 'Estadio BBVA Bancomer',     city: 'Monterrey' },
  { num: 55, date: 'Jun 25', time: '1:00PM',  team1: 'ECU', team2: 'GER', venue: 'MetLife Stadium',           city: 'East Rutherford' },
  { num: 56, date: 'Jun 25', time: '1:00PM',  team1: 'CUW', team2: 'CIV', venue: 'Lincoln Financial Field',   city: 'Philadelphia' },
  { num: 57, date: 'Jun 25', time: '4:00PM',  team1: 'TUN', team2: 'NED', venue: 'Arrowhead Stadium',         city: 'Kansas City' },
  { num: 58, date: 'Jun 25', time: '4:00PM',  team1: 'JPN', team2: 'SWE', venue: 'AT&T Stadium',              city: 'Arlington' },
  { num: 59, date: 'Jun 25', time: '7:00PM',  team1: 'TUR', team2: 'USA', venue: 'SoFi Stadium',              city: 'Inglewood' },
  { num: 60, date: 'Jun 25', time: '7:00PM',  team1: 'PAR', team2: 'AUS', venue: "Levi's Stadium",            city: 'Santa Clara' },
  { num: 61, date: 'Jun 26', time: '12:00PM', team1: 'NOR', team2: 'FRA', venue: 'Gillette Stadium',          city: 'Foxborough' },
  { num: 62, date: 'Jun 26', time: '12:00PM', team1: 'SEN', team2: 'IRQ', venue: 'BMO Field',                 city: 'Toronto' },
  { num: 63, date: 'Jun 26', time: '5:00PM',  team1: 'URU', team2: 'ESP', venue: 'Estadio Akron',             city: 'Guadalajara' },
  { num: 64, date: 'Jun 26', time: '5:00PM',  team1: 'CPV', team2: 'KSA', venue: 'NRG Stadium',               city: 'Houston' },
  { num: 65, date: 'Jun 26', time: '8:00PM',  team1: 'NZL', team2: 'BEL', venue: 'BC Place',                  city: 'Vancouver' },
  { num: 66, date: 'Jun 26', time: '8:00PM',  team1: 'EGY', team2: 'IRN', venue: 'Lumen Field',               city: 'Seattle' },
  { num: 67, date: 'Jun 27', time: '2:00PM',  team1: 'PAN', team2: 'ENG', venue: 'MetLife Stadium',           city: 'East Rutherford' },
  { num: 68, date: 'Jun 27', time: '2:00PM',  team1: 'CRO', team2: 'GHA', venue: 'Lincoln Financial Field',   city: 'Philadelphia' },
  { num: 69, date: 'Jun 27', time: '4:30PM',  team1: 'COL', team2: 'POR', venue: 'Hard Rock Stadium',         city: 'Miami' },
  { num: 70, date: 'Jun 27', time: '4:30PM',  team1: 'COD', team2: 'UZB', venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  { num: 71, date: 'Jun 27', time: '8:00PM',  team1: 'JOR', team2: 'ARG', venue: 'AT&T Stadium',              city: 'Arlington' },
  { num: 72, date: 'Jun 27', time: '8:00PM',  team1: 'ALG', team2: 'AUT', venue: 'Arrowhead Stadium',         city: 'Kansas City' },
];

const knockoutShells = [
  { round: 'R32', num: 73,  date: '2026-06-28T18:00:00Z' }, { round: 'R32', num: 74,  date: '2026-06-28T22:00:00Z' },
  { round: 'R32', num: 75,  date: '2026-06-29T18:00:00Z' }, { round: 'R32', num: 76,  date: '2026-06-29T22:00:00Z' },
  { round: 'R32', num: 77,  date: '2026-06-30T18:00:00Z' }, { round: 'R32', num: 78,  date: '2026-06-30T22:00:00Z' },
  { round: 'R32', num: 79,  date: '2026-07-01T18:00:00Z' }, { round: 'R32', num: 80,  date: '2026-07-01T22:00:00Z' },
  { round: 'R32', num: 81,  date: '2026-07-02T18:00:00Z' }, { round: 'R32', num: 82,  date: '2026-07-02T22:00:00Z' },
  { round: 'R32', num: 83,  date: '2026-07-03T18:00:00Z' }, { round: 'R32', num: 84,  date: '2026-07-03T22:00:00Z' },
  { round: 'R32', num: 85,  date: '2026-07-04T18:00:00Z' }, { round: 'R32', num: 86,  date: '2026-07-04T22:00:00Z' },
  { round: 'R32', num: 87,  date: '2026-07-05T18:00:00Z' }, { round: 'R32', num: 88,  date: '2026-07-05T22:00:00Z' },
  { round: 'R16', num: 89,  date: '2026-07-06T18:00:00Z' }, { round: 'R16', num: 90,  date: '2026-07-06T22:00:00Z' },
  { round: 'R16', num: 91,  date: '2026-07-07T18:00:00Z' }, { round: 'R16', num: 92,  date: '2026-07-07T22:00:00Z' },
  { round: 'R16', num: 93,  date: '2026-07-08T18:00:00Z' }, { round: 'R16', num: 94,  date: '2026-07-08T22:00:00Z' },
  { round: 'R16', num: 95,  date: '2026-07-09T18:00:00Z' }, { round: 'R16', num: 96,  date: '2026-07-09T22:00:00Z' },
  { round: 'QF',  num: 97,  date: '2026-07-10T18:00:00Z' }, { round: 'QF',  num: 98,  date: '2026-07-10T22:00:00Z' },
  { round: 'QF',  num: 99,  date: '2026-07-11T18:00:00Z' }, { round: 'QF',  num: 100, date: '2026-07-11T22:00:00Z' },
  { round: 'SF',  num: 101, date: '2026-07-14T22:00:00Z' }, { round: 'SF',  num: 102, date: '2026-07-15T22:00:00Z' },
  { round: 'FINAL', num: 103, date: '2026-07-19T22:00:00Z' },
];

const codeToGroup: Record<string, string> = {
  MEX:'A',RSA:'A',KOR:'A',CZE:'A', CAN:'B',BIH:'B',QAT:'B',SUI:'B',
  BRA:'C',MAR:'C',HAI:'C',SCO:'C', USA:'D',PAR:'D',AUS:'D',TUR:'D',
  GER:'E',CUW:'E',CIV:'E',ECU:'E', NED:'F',JPN:'F',SWE:'F',TUN:'F',
  BEL:'G',EGY:'G',IRN:'G',NZL:'G', ESP:'H',CPV:'H',KSA:'H',URU:'H',
  FRA:'I',SEN:'I',IRQ:'I',NOR:'I', ARG:'J',ALG:'J',AUT:'J',JOR:'J',
  POR:'K',COD:'K',UZB:'K',COL:'K', ENG:'L',CRO:'L',GHA:'L',PAN:'L',
};

async function seedMatches(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Seeding matches…');
    const { rows: teamRows } = await client.query<{ id: string; code: string }>('SELECT id, code FROM teams');
    const byCode: Record<string, string> = {};
    for (const t of teamRows) byCode[t.code] = t.id;

    let inserted = 0;
    for (const m of groupMatches) {
      const kickoff = ptToUtc(m.date, m.time);
      const t1 = byCode[m.team1]; const t2 = byCode[m.team2];
      if (!t1 || !t2) { console.warn(`Missing team: ${m.team1} or ${m.team2}`); continue; }
      await client.query(
        `INSERT INTO matches (team1_id, team2_id, round, group_name, kickoff_time, venue, city, is_locked, match_number)
         VALUES ($1,$2,'GROUP',$3,$4,$5,$6,false,$7) ON CONFLICT DO NOTHING`,
        [t1, t2, codeToGroup[m.team1], kickoff, m.venue, m.city, m.num]
      );
      inserted++;
    }
    console.log(`✅ Seeded ${inserted} group stage matches.`);

    let koInserted = 0;
    for (const ko of knockoutShells) {
      await client.query(
        `INSERT INTO matches (team1_id, team2_id, round, kickoff_time, is_locked, match_number)
         VALUES (NULL,NULL,$1,$2,false,$3) ON CONFLICT DO NOTHING`,
        [ko.round, ko.date, ko.num]
      );
      koInserted++;
    }
    console.log(`✅ Seeded ${koInserted} knockout shell matches.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seedMatches().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
