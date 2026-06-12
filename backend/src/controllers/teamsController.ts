import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';
import { TeamBasic, Player } from '../types';
import { syncTeamSquad } from '../services/syncService';

function toTeamBasic(row: Record<string, unknown>): TeamBasic {
  return {
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    groupName: (row.group_name as string | null) ?? null,
    groupPosition: (row.group_position as number | null) ?? null,
    flagUrl: (row.flag_url as string | null) ?? null,
    confederation: (row.confederation as string | null) ?? null,
  };
}

function toPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    teamId: row.team_id as string,
    name: row.name as string,
    shirtName: (row.shirt_name as string | null) ?? null,
    position: row.position as 'GK' | 'DF' | 'MF' | 'FW',
    jerseyNumber: (row.jersey_number as number | null) ?? null,
    dateOfBirth: row.date_of_birth ? (row.date_of_birth as Date).toISOString().split('T')[0] : null,
    club: (row.club as string | null) ?? null,
    heightCm: (row.height_cm as number | null) ?? null,
    photoUrl: (row.photo_url as string | null) ?? null,
  };
}

// GET /api/teams — Public
export async function getTeams(_req: Request, res: Response): Promise<void> {
  const rows = await query<Record<string, unknown>>(
    'SELECT id, name, code, group_name, group_position, flag_url, confederation FROM teams ORDER BY group_name, group_position'
  );
  res.json({ success: true, data: { teams: rows.map(toTeamBasic) } });
}

// GET /api/teams/group/:groupName — Public
export async function getTeamsByGroup(req: Request, res: Response): Promise<void> {
  const { groupName } = req.params as { groupName: string };
  const rows = await query<Record<string, unknown>>(
    'SELECT id, name, code, group_name, group_position, flag_url, confederation FROM teams WHERE group_name = $1 ORDER BY group_position',
    [groupName.toUpperCase()]
  );
  res.json({ success: true, data: { group: groupName.toUpperCase(), teams: rows.map(toTeamBasic) } });
}

// GET /api/teams/:id — Auth required
export async function getTeamById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const teamRow = await queryOne<Record<string, unknown>>(
    'SELECT id, name, code, group_name, group_position, flag_url, confederation, external_id FROM teams WHERE id = $1',
    [id]
  );
  if (!teamRow) { res.status(404).json({ success: false, error: 'Team not found' }); return; }

  let playersRows = await query<Record<string, unknown>>(
    'SELECT id, team_id, name, shirt_name, position, jersey_number, date_of_birth, club, height_cm, photo_url FROM players WHERE team_id = $1 ORDER BY jersey_number',
    [id]
  );

  // AUTO-SYNC Check: If no players and has external_id, try to sync
  if (playersRows.length === 0 && teamRow.external_id) {
    try {
      console.log(`Auto-syncing squad for team: ${teamRow.name}`);
      await syncTeamSquad(id);
      // Re-fetch players after sync
      playersRows = await query<Record<string, unknown>>(
        'SELECT id, team_id, name, shirt_name, position, jersey_number, date_of_birth, club, height_cm, photo_url FROM players WHERE team_id = $1 ORDER BY jersey_number',
        [id]
      );
    } catch (err) {
      console.error('Failed to auto-sync squad:', err);
    }
  }

  res.json({ success: true, data: { team: toTeamBasic(teamRow), players: playersRows.map(toPlayer) } });
}

