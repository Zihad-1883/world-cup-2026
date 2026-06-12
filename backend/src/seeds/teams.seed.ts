import 'dotenv/config';
import { pool } from '../config/db';

interface TeamSeed {
  name: string;
  code: string;
  group: string;
  pos: number;
  iso2: string;
  confederation: string;
}

const teams: TeamSeed[] = [
  // Group A
  { name: 'Mexico',         code: 'MEX', group: 'A', pos: 1, iso2: 'mx',     confederation: 'CONCACAF' },
  { name: 'South Africa',   code: 'RSA', group: 'A', pos: 2, iso2: 'za',     confederation: 'CAF' },
  { name: 'Korea Republic', code: 'KOR', group: 'A', pos: 3, iso2: 'kr',     confederation: 'AFC' },
  { name: 'Czechia',        code: 'CZE', group: 'A', pos: 4, iso2: 'cz',     confederation: 'UEFA' },
  // Group B
  { name: 'Canada',                 code: 'CAN', group: 'B', pos: 1, iso2: 'ca',     confederation: 'CONCACAF' },
  { name: 'Bosnia & Herzegovina',   code: 'BIH', group: 'B', pos: 2, iso2: 'ba',     confederation: 'UEFA' },
  { name: 'Qatar',                  code: 'QAT', group: 'B', pos: 3, iso2: 'qa',     confederation: 'AFC' },
  { name: 'Switzerland',            code: 'SUI', group: 'B', pos: 4, iso2: 'ch',     confederation: 'UEFA' },
  // Group C
  { name: 'Brazil',   code: 'BRA', group: 'C', pos: 1, iso2: 'br',     confederation: 'CONMEBOL' },
  { name: 'Morocco',  code: 'MAR', group: 'C', pos: 2, iso2: 'ma',     confederation: 'CAF' },
  { name: 'Haiti',    code: 'HAI', group: 'C', pos: 3, iso2: 'ht',     confederation: 'CONCACAF' },
  { name: 'Scotland', code: 'SCO', group: 'C', pos: 4, iso2: 'gb-sct', confederation: 'UEFA' },
  // Group D
  { name: 'United States', code: 'USA', group: 'D', pos: 1, iso2: 'us',     confederation: 'CONCACAF' },
  { name: 'Paraguay',      code: 'PAR', group: 'D', pos: 2, iso2: 'py',     confederation: 'CONMEBOL' },
  { name: 'Australia',     code: 'AUS', group: 'D', pos: 3, iso2: 'au',     confederation: 'AFC' },
  { name: 'Türkiye',       code: 'TUR', group: 'D', pos: 4, iso2: 'tr',     confederation: 'UEFA' },
  // Group E
  { name: 'Germany',       code: 'GER', group: 'E', pos: 1, iso2: 'de',     confederation: 'UEFA' },
  { name: 'Curaçao',       code: 'CUW', group: 'E', pos: 2, iso2: 'cw',     confederation: 'CONCACAF' },
  { name: "Côte d'Ivoire", code: 'CIV', group: 'E', pos: 3, iso2: 'ci',     confederation: 'CAF' },
  { name: 'Ecuador',       code: 'ECU', group: 'E', pos: 4, iso2: 'ec',     confederation: 'CONMEBOL' },
  // Group F
  { name: 'Netherlands', code: 'NED', group: 'F', pos: 1, iso2: 'nl',     confederation: 'UEFA' },
  { name: 'Japan',        code: 'JPN', group: 'F', pos: 2, iso2: 'jp',     confederation: 'AFC' },
  { name: 'Sweden',       code: 'SWE', group: 'F', pos: 3, iso2: 'se',     confederation: 'UEFA' },
  { name: 'Tunisia',      code: 'TUN', group: 'F', pos: 4, iso2: 'tn',     confederation: 'CAF' },
  // Group G
  { name: 'Belgium',     code: 'BEL', group: 'G', pos: 1, iso2: 'be',     confederation: 'UEFA' },
  { name: 'Egypt',       code: 'EGY', group: 'G', pos: 2, iso2: 'eg',     confederation: 'CAF' },
  { name: 'IR Iran',     code: 'IRN', group: 'G', pos: 3, iso2: 'ir',     confederation: 'AFC' },
  { name: 'New Zealand', code: 'NZL', group: 'G', pos: 4, iso2: 'nz',     confederation: 'OFC' },
  // Group H
  { name: 'Spain',         code: 'ESP', group: 'H', pos: 1, iso2: 'es',     confederation: 'UEFA' },
  { name: 'Cabo Verde',    code: 'CPV', group: 'H', pos: 2, iso2: 'cv',     confederation: 'CAF' },
  { name: 'Saudi Arabia',  code: 'KSA', group: 'H', pos: 3, iso2: 'sa',     confederation: 'AFC' },
  { name: 'Uruguay',       code: 'URU', group: 'H', pos: 4, iso2: 'uy',     confederation: 'CONMEBOL' },
  // Group I
  { name: 'France',   code: 'FRA', group: 'I', pos: 1, iso2: 'fr',     confederation: 'UEFA' },
  { name: 'Senegal',  code: 'SEN', group: 'I', pos: 2, iso2: 'sn',     confederation: 'CAF' },
  { name: 'Iraq',     code: 'IRQ', group: 'I', pos: 3, iso2: 'iq',     confederation: 'AFC' },
  { name: 'Norway',   code: 'NOR', group: 'I', pos: 4, iso2: 'no',     confederation: 'UEFA' },
  // Group J
  { name: 'Argentina', code: 'ARG', group: 'J', pos: 1, iso2: 'ar',     confederation: 'CONMEBOL' },
  { name: 'Algeria',   code: 'ALG', group: 'J', pos: 2, iso2: 'dz',     confederation: 'CAF' },
  { name: 'Austria',   code: 'AUT', group: 'J', pos: 3, iso2: 'at',     confederation: 'UEFA' },
  { name: 'Jordan',    code: 'JOR', group: 'J', pos: 4, iso2: 'jo',     confederation: 'AFC' },
  // Group K
  { name: 'Portugal',  code: 'POR', group: 'K', pos: 1, iso2: 'pt',     confederation: 'UEFA' },
  { name: 'Congo DR',  code: 'COD', group: 'K', pos: 2, iso2: 'cd',     confederation: 'CAF' },
  { name: 'Uzbekistan',code: 'UZB', group: 'K', pos: 3, iso2: 'uz',     confederation: 'AFC' },
  { name: 'Colombia',  code: 'COL', group: 'K', pos: 4, iso2: 'co',     confederation: 'CONMEBOL' },
  // Group L
  { name: 'England',  code: 'ENG', group: 'L', pos: 1, iso2: 'gb-eng', confederation: 'UEFA' },
  { name: 'Croatia',  code: 'CRO', group: 'L', pos: 2, iso2: 'hr',     confederation: 'UEFA' },
  { name: 'Ghana',    code: 'GHA', group: 'L', pos: 3, iso2: 'gh',     confederation: 'CAF' },
  { name: 'Panama',   code: 'PAN', group: 'L', pos: 4, iso2: 'pa',     confederation: 'CONCACAF' },
];

async function seedTeams(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Seeding teams…');
    let inserted = 0;
    for (const t of teams) {
      const flagUrl = `https://flagcdn.com/w40/${t.iso2}.png`;
      await client.query(
        `INSERT INTO teams (name, code, group_name, group_position, flag_url, confederation)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [t.name, t.code, t.group, t.pos, flagUrl, t.confederation]
      );
      inserted++;
    }
    console.log(`✅ Seeded ${inserted} teams.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seedTeams().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
