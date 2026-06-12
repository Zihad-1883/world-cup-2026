import { pool } from '../config/db';
import { Round } from '../types';

const POINTS: Record<Round, number> = {
  GROUP: 1,
  R32: 2,
  R16: 3,
  QF: 4,
  SF: 6,
  FINAL: 10,
};

export async function scoreMatchPredictions(
  matchId: string,
  actualWinnerId: string | null,
  round: Round
): Promise<void> {
  const client = await pool.connect();
  try {
    // Get all predictions for this match
    const { rows: predictions } = await client.query<{
      id: string;
      predicted_winner_id: string;
    }>(
      'SELECT id, predicted_winner_id FROM predictions WHERE match_id = $1',
      [matchId]
    );

    if (!predictions.length) return;

    const pointsForRound = POINTS[round];

    // Bulk update each prediction
    for (const pred of predictions) {
      const isCorrect = pred.predicted_winner_id === actualWinnerId;
      const pointsEarned = isCorrect ? pointsForRound : 0;

      await client.query(
        `UPDATE predictions
         SET is_correct = $1, points_earned = $2, updated_at = NOW()
         WHERE id = $3`,
        [isCorrect, pointsEarned, pred.id]
      );
    }

    console.log(`✅ Scored ${predictions.length} predictions for match ${matchId} (round: ${round})`);
  } catch (err) {
    console.error('Error scoring predictions:', err);
    throw err;
  } finally {
    client.release();
  }
}

export async function scoreGroupQualifiers(
  groupName: string,
  team1Id: string | null,
  team2Id: string | null,
  team3Id?: string | null
): Promise<void> {
  const client = await pool.connect();
  try {
    // 1. Update group_qualifiers table
    await client.query(
      `INSERT INTO group_qualifiers (group_name, team_id, position, qualified)
       VALUES ($1, $2, 1, true)
       ON CONFLICT (group_name, position) DO UPDATE SET team_id = $2, qualified = true, updated_at = NOW()`,
      [groupName, team1Id]
    );
    await client.query(
      `INSERT INTO group_qualifiers (group_name, team_id, position, qualified)
       VALUES ($1, $2, 2, true)
       ON CONFLICT (group_name, position) DO UPDATE SET team_id = $2, qualified = true, updated_at = NOW()`,
      [groupName, team2Id]
    );
    if (team3Id) {
      await client.query(
        `INSERT INTO group_qualifiers (group_name, team_id, position, qualified)
         VALUES ($1, $2, 3, true)
         ON CONFLICT (group_name, position) DO UPDATE SET team_id = $2, qualified = true, updated_at = NOW()`,
        [groupName, team3Id]
      );
    }

    // 2. Score Lite Predictions (2 pts per correct qualifier)
    const { rows: predictions } = await client.query<{
      id: string;
      user_id: string;
      team1_id: string;
      team2_id: string;
      team3_id: string | null;
    }>(
      'SELECT id, user_id, team1_id, team2_id, team3_id FROM group_predictions_lite WHERE group_name = $1',
      [groupName]
    );

    for (const pred of predictions) {
      // Score Lite Predictions (0.5 pts per correct qualifier)
      let points = 0;
      // Check if user's pick 1 or 2 is in the actual qualifiers
      if (pred.team1_id === team1Id || pred.team1_id === team2Id) points += 0.5;
      if (pred.team2_id === team1Id || pred.team2_id === team2Id) points += 0.5;

      await client.query(
        'UPDATE group_predictions_lite SET points_earned = $1, updated_at = NOW() WHERE id = $2',
        [points, pred.id]
      );

      // Log points
      await client.query(
        `INSERT INTO user_points_log (user_id, mode, points, round, source_id)
         VALUES ($1, 'LITE', $2, 'GROUP', $3)`,
        [pred.user_id, points, pred.id]
      );
    }

    console.log(`✅ Scored ${predictions.length} Lite predictions for Group ${groupName}`);
  } catch (err) {
    console.error('Error scoring qualifiers:', err);
    throw err;
  } finally {
    client.release();
  }
}

