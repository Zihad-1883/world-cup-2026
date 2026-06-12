import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';
import { Player } from '../types';

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

// GET /api/players/team/:teamId
export async function getPlayersByTeam(req: Request, res: Response): Promise<void> {
  const { teamId } = req.params as { teamId: string };
  const rows = await query<Record<string, unknown>>(
    'SELECT id, team_id, name, shirt_name, position, jersey_number, date_of_birth, club, height_cm, photo_url FROM players WHERE team_id = $1 ORDER BY jersey_number',
    [teamId]
  );
  res.json({ success: true, data: { players: rows.map(toPlayer) } });
}

// GET /api/players/:id
export async function getPlayerById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const row = await queryOne<Record<string, unknown>>(
    'SELECT id, team_id, name, shirt_name, position, jersey_number, date_of_birth, club, height_cm, photo_url FROM players WHERE id = $1',
    [id]
  );
  if (!row) { res.status(404).json({ success: false, error: 'Player not found' }); return; }
  res.json({ success: true, data: { player: toPlayer(row) } });
}
