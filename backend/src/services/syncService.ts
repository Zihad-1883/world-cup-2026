import { query } from '../config/db';
import { scoreMatchPredictions } from './predictionScoring';
import { Round } from '../types';

interface FootballDataMatch {
  id: number;
  status: string;
  score: {
    fullTime: { home: number | null; away: number | null };
    winner: string | null; // HOME_TEAM, AWAY_TEAM, DRAW, null
  };
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  stage: string;
}

interface FootballDataResponse {
  matches: FootballDataMatch[];
}

function stageToRound(stage: string): Round {
  const map: Record<string, Round> = {
    GROUP_STAGE: 'GROUP',
    ROUND_OF_32: 'R32',
    ROUND_OF_16: 'R16',
    QUARTER_FINALS: 'QF',
    SEMI_FINALS: 'SF',
    FINAL: 'FINAL',
  };
  return map[stage] ?? 'GROUP';
}

export async function syncLiveMatches(): Promise<{ updated: number; message: string }> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey || apiKey === 'your_football_data_api_key_here') {
    return { updated: 0, message: 'FOOTBALL_DATA_API_KEY not configured' };
  }

  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    { headers: { 'X-Auth-Token': apiKey } }
  );

  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status}`);
  }

  const data = (await response.json()) as FootballDataResponse;
  
  // Handled statuses: FINISHED (lock and score), IN_PLAY (update score only)
  const relevantMatches = data.matches.filter((m) => ['FINISHED', 'IN_PLAY', 'PAUSED'].includes(m.status));

  let updated = 0;

  for (const fdMatch of relevantMatches) {
    const externalId = String(fdMatch.id);

    // Update team external_ids based on codes if missing
    if (fdMatch.homeTeam.id) {
       await query('UPDATE teams SET external_id = $1 WHERE code = $2 AND external_id IS NULL', [String(fdMatch.homeTeam.id), fdMatch.homeTeam.name.substring(0,3).toUpperCase()]);
    }
    if (fdMatch.awayTeam.id) {
       await query('UPDATE teams SET external_id = $1 WHERE code = $2 AND external_id IS NULL', [String(fdMatch.awayTeam.id), fdMatch.awayTeam.name.substring(0,3).toUpperCase()]);
    }

    // Find our match by external_id
    const rows = await query<Record<string, unknown>>(
      'SELECT id, team1_id, team2_id, round, is_locked FROM matches WHERE external_id = $1',
      [externalId]
    );

    if (!rows.length) continue;

    const match = rows[0];
    
    // Don't update if already locked and it's just a live update
    if (match.is_locked && fdMatch.status !== 'FINISHED') continue;

    const team1Score = fdMatch.score.fullTime.home ?? 0;
    const team2Score = fdMatch.score.fullTime.away ?? 0;

    if (fdMatch.status === 'FINISHED') {
      // Determine actual_winner_id
      let actualWinnerId: string | null = null;
      if (fdMatch.score.winner === 'HOME_TEAM') {
        actualWinnerId = match.team1_id as string;
      } else if (fdMatch.score.winner === 'AWAY_TEAM') {
        actualWinnerId = match.team2_id as string;
      }

      await query(
        `UPDATE matches
         SET team1_score = $1, team2_score = $2, actual_winner_id = $3, is_locked = true
         WHERE id = $4`,
        [team1Score, team2Score, actualWinnerId, match.id]
      );

      const round = stageToRound(fdMatch.stage);
      await scoreMatchPredictions(match.id as string, actualWinnerId, round);
      updated++;
    } else {
      // LIVE UPDATE (IN_PLAY or PAUSED)
      await query(
        `UPDATE matches
         SET team1_score = $1, team2_score = $2
         WHERE id = $3 AND is_locked = false`,
        [team1Score, team2Score, match.id]
      );
      updated++;
    }
  }

  return { updated, message: `Synced ${updated} matches (including live updates)` };
}

export async function syncAllTeams(): Promise<{ updated: number; message: string }> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey || apiKey === 'your_football_data_api_key_here') {
    return { updated: 0, message: 'FOOTBALL_DATA_API_KEY not configured' };
  }

  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/teams?season=2026',
    { headers: { 'X-Auth-Token': apiKey } }
  );

  if (!response.ok) {
    throw new Error(`football-data.org API error (teams): ${response.status}`);
  }

  const data = (await response.json()) as { teams: any[] };
  let updated = 0;

  for (const fdTeam of data.teams) {
    const externalId = String(fdTeam.id);
    const code = fdTeam.tla || fdTeam.name.substring(0, 3).toUpperCase();

    // Try to match by code or name
    const rows = await query<{ id: string }>(
      'UPDATE teams SET external_id = $1 WHERE code = $2 OR name = $3 RETURNING id',
      [externalId, code, fdTeam.name]
    );

    if (rows.length > 0) updated++;
  }

  return { updated, message: `Linked ${updated} teams with external IDs` };
}

interface FootballDataSquadMember {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
}

interface FootballDataTeamResponse {
  id: number;
  name: string;
  squad: FootballDataSquadMember[];
}

export async function syncTeamSquad(teamId: string): Promise<{ updated: number; message: string }> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey || apiKey === 'your_football_data_api_key_here') {
    return { updated: 0, message: 'FOOTBALL_DATA_API_KEY not configured' };
  }

  // Find the team's external_id
  const teamRow = await queryOne<{ external_id: string | null }>(
    'SELECT external_id FROM teams WHERE id = $1',
    [teamId]
  );

  if (!teamRow?.external_id) {
    return { updated: 0, message: 'Team has no external ID linked. Run match sync first.' };
  }

  const response = await fetch(
    `https://api.football-data.org/v4/teams/${teamRow.external_id}`,
    { headers: { 'X-Auth-Token': apiKey } }
  );

  if (!response.ok) {
    throw new Error(`football-data.org API error (team): ${response.status}`);
  }

  const data = (await response.json()) as FootballDataTeamResponse;
  let updated = 0;

  console.log('Sample Member:', JSON.stringify(data.squad[0], null, 2));

  for (const member of data.squad) {
    // Basic mapping for positions
    let pos: 'GK' | 'DF' | 'MF' | 'FW' = 'MF';
    if (member.position === 'Goalkeeper') pos = 'GK';
    else if (member.position === 'Defence') pos = 'DF';
    else if (member.position === 'Midfield') pos = 'MF';
    else if (member.position === 'Offence') pos = 'FW';

    // Check if player exists
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM players WHERE team_id = $1 AND (name = $2 OR shirt_name = $2)',
      [teamId, member.name]
    );

    if (existing) {
       await query(
         'UPDATE players SET position = $1, date_of_birth = $2 WHERE id = $3',
         [pos, member.dateOfBirth, existing.id]
       );
    } else {
       await query(
         'INSERT INTO players (team_id, name, shirt_name, position, date_of_birth) VALUES ($1, $2, $3, $4, $5)',
         [teamId, member.name, member.name, pos, member.dateOfBirth]
       );
    }
    updated++;
  }

  return { updated, message: `Synced ${updated} squad members for ${data.name}` };
}

async function queryOne<T>(sql: string, params: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

