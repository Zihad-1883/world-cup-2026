import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';
import { scoreMatchPredictions } from '../services/predictionScoring';
import { MatchBasic, MatchFull, Round } from '../types';

function toMatchBasic(row: Record<string, unknown>): MatchBasic {
  return {
    id: row.id as string,
    team1Id: (row.team1_id as string | null) ?? null,
    team2Id: (row.team2_id as string | null) ?? null,
    team1Name: (row.team1_name as string | null) ?? null,
    team2Name: (row.team2_name as string | null) ?? null,
    team1Code: (row.team1_code as string | null) ?? null,
    team2Code: (row.team2_code as string | null) ?? null,
    team1FlagUrl: (row.team1_flag_url as string | null) ?? null,
    team2FlagUrl: (row.team2_flag_url as string | null) ?? null,
    round: row.round as Round,
    groupName: (row.group_name as string | null) ?? null,
    kickoffTime: (row.kickoff_time as Date).toISOString(),
    venue: (row.venue as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    isLocked: row.is_locked as boolean,
    team1Score: (row.team1_score as number | null) ?? null,
    team2Score: (row.team2_score as number | null) ?? null,
    actualWinnerId: (row.actual_winner_id as string | null) ?? null,
    matchNumber: (row.match_number as number | null) ?? null,
    externalId: (row.external_id as string | null) ?? null,
  };
}

const MATCH_SELECT = `
  SELECT
    m.id, m.team1_id, m.team2_id, m.round, m.group_name,
    m.kickoff_time, m.venue, m.city, m.team1_score, m.team2_score,
    m.actual_winner_id, m.is_locked, m.match_number, m.external_id,
    t1.name AS team1_name, t1.code AS team1_code, t1.flag_url AS team1_flag_url,
    t2.name AS team2_name, t2.code AS team2_code, t2.flag_url AS team2_flag_url
  FROM matches m
  LEFT JOIN teams t1 ON t1.id = m.team1_id
  LEFT JOIN teams t2 ON t2.id = m.team2_id
`;

// GET /api/matches
export async function getMatches(req: Request, res: Response): Promise<void> {
  const roundParam = req.query['round'];
  const groupParam = req.query['group'];
  const round = roundParam !== undefined ? String(roundParam) : undefined;
  const group = groupParam !== undefined ? String(groupParam) : undefined;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (round) { conditions.push(`m.round = $${i++}`); values.push(round.toUpperCase()); }
  if (group) { conditions.push(`m.group_name = $${i++}`); values.push(group.toUpperCase()); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query<Record<string, unknown>>(
    `${MATCH_SELECT} ${where} ORDER BY m.kickoff_time`,
    values
  );
  res.json({ success: true, data: { matches: rows.map(toMatchBasic) } });
}

// GET /api/matches/round/:round
export async function getMatchesByRound(req: Request, res: Response): Promise<void> {
  const round = String(req.params.round).toUpperCase();
  const rows = await query<Record<string, unknown>>(
    `${MATCH_SELECT} WHERE m.round = $1 ORDER BY m.kickoff_time`,
    [round]
  );
  res.json({ success: true, data: { round, matches: rows.map(toMatchBasic) } });
}

// GET /api/matches/:id — Auth required
export async function getMatchById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const row = await queryOne<Record<string, unknown>>(
    `${MATCH_SELECT} WHERE m.id = $1`,
    [id]
  );
  if (!row) { res.status(404).json({ success: false, error: 'Match not found' }); return; }

  const base = toMatchBasic(row);

  // Build team objects
  const team1 = base.team1Id ? {
    id: base.team1Id, name: base.team1Name!, code: base.team1Code!,
    groupName: null, groupPosition: null, flagUrl: base.team1FlagUrl, confederation: null
  } : null;
  const team2 = base.team2Id ? {
    id: base.team2Id, name: base.team2Name!, code: base.team2Code!,
    groupName: null, groupPosition: null, flagUrl: base.team2FlagUrl, confederation: null
  } : null;

  let actualWinner = null;
  if (base.actualWinnerId) {
    const wr = await queryOne<Record<string, unknown>>(
      'SELECT id, name, code, group_name, group_position, flag_url, confederation FROM teams WHERE id = $1',
      [base.actualWinnerId]
    );
    if (wr) actualWinner = {
      id: wr.id as string, name: wr.name as string, code: wr.code as string,
      groupName: (wr.group_name as string | null) ?? null,
      groupPosition: (wr.group_position as number | null) ?? null,
      flagUrl: (wr.flag_url as string | null) ?? null,
      confederation: (wr.confederation as string | null) ?? null,
    };
  }

  const matchFull: MatchFull = { ...base, team1, team2, actualWinner };
  res.json({ success: true, data: { match: matchFull } });
}

// PATCH /api/matches/:id/result — Admin only
export async function updateMatchResult(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { team1Score, team2Score, actualWinnerId } = req.body as {
    team1Score: number; team2Score: number; actualWinnerId: string | null;
  };

  if (team1Score === undefined || team2Score === undefined) {
    res.status(400).json({ success: false, error: 'team1Score and team2Score are required' });
    return;
  }

  const rows = await query<Record<string, unknown>>(
    `UPDATE matches SET
      team1_score = $1, team2_score = $2, actual_winner_id = $3, is_locked = true
     WHERE id = $4
     RETURNING id, round`,
    [team1Score, team2Score, actualWinnerId ?? null, id]
  );

  if (!rows.length) { res.status(404).json({ success: false, error: 'Match not found' }); return; }

  // Trigger prediction scoring
  await scoreMatchPredictions(id, actualWinnerId ?? null, rows[0].round as Round);

  // Return updated match
  const updated = await queryOne<Record<string, unknown>>(`${MATCH_SELECT} WHERE m.id = $1`, [id]);
  res.json({ success: true, data: { match: toMatchBasic(updated!) } });
}

// PATCH /api/matches/:id/lock — Admin only
export async function lockMatch(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { isLocked } = req.body as { isLocked: boolean };

  if (typeof isLocked !== 'boolean') {
    res.status(400).json({ success: false, error: 'isLocked must be a boolean' });
    return;
  }

  const rows = await query<Record<string, unknown>>(
    `UPDATE matches SET is_locked = $1 WHERE id = $2 RETURNING id`,
    [isLocked, id]
  );
  if (!rows.length) { res.status(404).json({ success: false, error: 'Match not found' }); return; }

  const updated = await queryOne<Record<string, unknown>>(`${MATCH_SELECT} WHERE m.id = $1`, [id]);
  res.json({ success: true, data: { match: toMatchBasic(updated!) } });
}
