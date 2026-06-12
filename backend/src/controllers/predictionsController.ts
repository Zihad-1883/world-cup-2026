import { Request, Response } from 'express';
import { pool, query, queryOne } from '../config/db';
import { getPredictionStats } from '../services/statsService';
import { Prediction, PredictionWithMatch, AccuracyStats, Round } from '../types';

function toPrediction(row: Record<string, unknown>): Prediction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    matchId: row.match_id as string,
    predictedWinnerId: (row.predicted_winner_id as string | null) ?? null,
    predictedSlot: (row.predicted_slot as number | null) ?? null,
    isCorrect: (row.is_correct as boolean | null) ?? null,
    pointsEarned: (row.points_earned as number) ?? 0,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// POST /api/predictions
export async function submitPredictions(req: Request, res: Response): Promise<void> {
  // Guest check — no auth = no save
  if (!req.user) {
    res.json({ success: true, data: { saved: 0, skipped: 0, predictions: [], guest: true } });
    return;
  }

  const userId = req.user.userId;
  const { predictions } = req.body as {
    predictions?: Array<{ matchId: string; predictedWinnerId?: string | null; predictedSlot?: number | null }>;
  };

  if (!Array.isArray(predictions) || predictions.length === 0) {
    res.status(400).json({ success: false, error: 'predictions array is required' });
    return;
  }

  let saved = 0;
  let skipped = 0;
  const savedPredictions: Prediction[] = [];

  const client = await pool.connect();
  try {
    for (const pred of predictions) {
      const { matchId, predictedWinnerId, predictedSlot } = pred;

      // Validate match exists, not locked, kickoff in future
      const matchRows = await client.query<{
        id: string; team1_id: string | null; team2_id: string | null;
        is_locked: boolean; kickoff_time: Date;
      }>(
        'SELECT id, team1_id, team2_id, is_locked, kickoff_time FROM matches WHERE id = $1',
        [matchId]
      );

      if (!matchRows.rows.length) { skipped++; continue; }

      const match = matchRows.rows[0];

      // Skip locked matches silently
      if (match.is_locked) { skipped++; continue; }

      // Skip if kickoff already passed (allow grace period? no, keep strict)
      if (new Date(match.kickoff_time) <= new Date()) { skipped++; continue; }

      // Logic check:
      // If we have a slot pick, it's valid regardless of team1_id/team2_id
      // If we have a team pick, it must be team1 or team2
      let saveWinnerId: string | null = predictedWinnerId || null;
      let saveSlot: number | null = predictedSlot || null;

      if (saveSlot) {
        if (saveSlot !== 1 && saveSlot !== 2) { skipped++; continue; }
        saveWinnerId = null; // Slot pick overrides specific team pick if both sent
      } else if (saveWinnerId) {
        // Validate predictedWinnerId is team1 or team2 if they exist
        if (match.team1_id && match.team2_id) {
           if (saveWinnerId !== match.team1_id && saveWinnerId !== match.team2_id) {
             skipped++; continue;
           }
        }
        saveSlot = null;
      } else {
        skipped++; continue; // Nothing to save
      }

      // UPSERT
      const result = await client.query<Record<string, unknown>>(
        `INSERT INTO predictions (user_id, match_id, predicted_winner_id, predicted_slot)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, match_id)
         DO UPDATE SET 
            predicted_winner_id = EXCLUDED.predicted_winner_id, 
            predicted_slot = EXCLUDED.predicted_slot,
            updated_at = NOW()
         RETURNING id, user_id, match_id, predicted_winner_id, predicted_slot, is_correct, points_earned, created_at, updated_at`,
        [userId, matchId, saveWinnerId, saveSlot]
      );

      savedPredictions.push(toPrediction(result.rows[0]));
      saved++;
    }
  } finally {
    client.release();
  }

  res.json({ success: true, data: { saved, skipped, predictions: savedPredictions } });
}

// GET /api/predictions/me
export async function getMyPredictions(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const rows = await query<Record<string, unknown>>(
    `SELECT
      p.id, p.user_id, p.match_id, p.predicted_winner_id, p.predicted_slot, p.is_correct, p.points_earned,
      p.created_at, p.updated_at,
      m.team1_id, m.team2_id, m.round, m.group_name, m.kickoff_time,
      m.venue, m.city, m.is_locked, m.team1_score, m.team2_score,
      m.actual_winner_id, m.match_number, m.external_id,
      t1.name AS team1_name, t1.code AS team1_code, t1.flag_url AS team1_flag_url,
      t2.name AS team2_name, t2.code AS team2_code, t2.flag_url AS team2_flag_url,
      pw.id AS pw_id, pw.name AS pw_name, pw.code AS pw_code,
      pw.group_name AS pw_group, pw.group_position AS pw_pos,
      pw.flag_url AS pw_flag, pw.confederation AS pw_conf
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     LEFT JOIN teams t1 ON t1.id = m.team1_id
     LEFT JOIN teams t2 ON t2.id = m.team2_id
     LEFT JOIN teams pw ON pw.id = p.predicted_winner_id
     WHERE p.user_id = $1
     ORDER BY m.kickoff_time`,
    [userId]
  );

  const predictions: PredictionWithMatch[] = rows.map((r) => ({
    id: r.id as string,
    userId: r.user_id as string,
    matchId: r.match_id as string,
    predictedWinnerId: (r.predicted_winner_id as string | null) ?? null,
    predictedSlot: (r.predicted_slot as number | null) ?? null,
    isCorrect: (r.is_correct as boolean | null) ?? null,
    pointsEarned: (r.points_earned as number) ?? 0,
    createdAt: (r.created_at as Date).toISOString(),
    updatedAt: (r.updated_at as Date).toISOString(),
    match: {
      id: r.match_id as string,
      team1Id: (r.team1_id as string | null) ?? null,
      team2Id: (r.team2_id as string | null) ?? null,
      team1Name: (r.team1_name as string | null) ?? null,
      team2Name: (r.team2_name as string | null) ?? null,
      team1Code: (r.team1_code as string | null) ?? null,
      team2Code: (r.team2_code as string | null) ?? null,
      team1FlagUrl: (r.team1_flag_url as string | null) ?? null,
      team2FlagUrl: (r.team2_flag_url as string | null) ?? null,
      round: r.round as Round,
      groupName: (r.group_name as string | null) ?? null,
      kickoffTime: (r.kickoff_time as Date).toISOString(),
      venue: (r.venue as string | null) ?? null,
      city: (r.city as string | null) ?? null,
      isLocked: r.is_locked as boolean,
      team1Score: (r.team1_score as number | null) ?? null,
      team2Score: (r.team2_score as number | null) ?? null,
      actualWinnerId: (r.actual_winner_id as string | null) ?? null,
      matchNumber: (r.match_number as number | null) ?? null,
      externalId: (r.external_id as string | null) ?? null,
    },
    predictedWinner: {
      id: r.pw_id as string,
      name: r.pw_name as string,
      code: r.pw_code as string,
      groupName: (r.pw_group as string | null) ?? null,
      groupPosition: (r.pw_pos as number | null) ?? null,
      flagUrl: (r.pw_flag as string | null) ?? null,
      confederation: (r.pw_conf as string | null) ?? null,
    },
  }));

  res.json({ success: true, data: { predictions } });
}

// GET /api/predictions/me/accuracy
export async function getMyAccuracy(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  // 1. Get user mode
  const user = await queryOne<{ prediction_mode: string }>(
    'SELECT prediction_mode FROM users WHERE id = $1', [userId]
  );
  if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
  const mode = user.prediction_mode;

  const rounds: Round[] = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'FINAL'];
  const byRound: AccuracyStats['byRound'] = {} as AccuracyStats['byRound'];
  for (const r of rounds) byRound[r] = { total: 0, correct: 0 };

  let total = 0, correct = 0, incorrect = 0, pending = 0, pointsTotal = 0;

  if (mode === 'PRO' || mode === 'HYBRID') {
    // Pro mode: matches
    const rows = await query<Record<string, unknown>>(
      `SELECT p.is_correct, p.points_earned, m.round
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       WHERE p.user_id = $1`,
      [userId]
    );

    for (const row of rows) {
      total++;
      const r = row.round as Round;
      byRound[r].total++;
      if (row.is_correct === null) { pending++; }
      else if (row.is_correct) {
        correct++;
        byRound[r].correct++;
        pointsTotal += row.points_earned as number;
      } else { incorrect++; }
    }
  } else {
    // Lite mode: picks
    // For Lite mode, GROUP round comes from group_predictions_lite
    const liteRows = await query<Record<string, unknown>>(
      'SELECT team1_id, team2_id, points_earned FROM group_predictions_lite WHERE user_id = $1',
      [userId]
    );
    
    // We count each group as 1 "prediction set" or 2 individual teams?
    // Let's count 12 groups * 2 teams = 24 predictions for GROUP round.
    total = 24; 
    byRound.GROUP.total = 24;
    
    for (const row of liteRows) {
       // Each group gives points (0, 2, or 4)
       // pointsTotal += (row.points_earned as number);
       const pts = row.points_earned as number;
       pointsTotal += pts;
       correct += (pts / 2); // 2 pts each
       byRound.GROUP.correct += (pts / 2);
    }
    pending = 24 - (liteRows.length * 2); // simplistic
    incorrect = (liteRows.length * 2) - correct;

    // Add knockout rounds from normal predictions (they are the same)
    const koRows = await query<Record<string, unknown>>(
      `SELECT p.is_correct, p.points_earned, m.round
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       WHERE p.user_id = $1 AND m.round != 'GROUP'`,
      [userId]
    );
    for (const row of koRows) {
      total++;
      const r = row.round as Round;
      byRound[r].total++;
      if (row.is_correct === null) { pending++; }
      else if (row.is_correct) {
        correct++;
        byRound[r].correct++;
        pointsTotal += row.points_earned as number;
      } else { incorrect++; }
    }
  }

  const accuracyPercent = (total - pending) > 0
    ? Math.round((correct / (total - pending)) * 100)
    : 0;

  res.json({ success: true, data: { total, correct, incorrect, pending, accuracyPercent, pointsTotal, byRound } });
}


// GET /api/predictions/stats — Public
export async function getStats(_req: Request, res: Response): Promise<void> {
  const stats = await getPredictionStats();
  res.json({ success: true, data: stats });
}
