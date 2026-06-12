import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';

// POST /api/predictions/lite/groups
export async function submitLitePredictions(req: Request, res: Response): Promise<void> {
  const { selections } = req.body as { selections: Record<string, string[]> };
  const userId = req.user!.userId;

  if (!selections || typeof selections !== 'object') {
    res.status(400).json({ success: false, error: 'Invalid selections format' });
    return;
  }

  try {
    let saved = 0;
    for (const [groupName, teamIds] of Object.entries(selections)) {
      if (teamIds.length > 3) {
        res.status(400).json({ success: false, error: `Group ${groupName} cannot have more than 3 teams` });
        return;
      }

      await query(
        `INSERT INTO group_predictions_lite (user_id, group_name, team1_id, team2_id, team3_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, group_name) 
         DO UPDATE SET team1_id = $3, team2_id = $4, team3_id = $5, updated_at = NOW()`,
        [userId, groupName, teamIds[0] || null, teamIds[1] || null, teamIds[2] || null]
      );
      saved++;
    }

    res.json({ success: true, data: { saved } });
  } catch (err) {
    console.error('Error saving lite predictions:', err);
    res.status(500).json({ success: false, error: 'Failed to save predictions' });
  }
}

// GET /api/predictions/lite/me
export async function getMyLitePredictions(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const rows = await query<Record<string, unknown>>(
    `SELECT 
      gpl.group_name, 
      gpl.team1_id, 
      gpl.team2_id, 
      gpl.team3_id,
      gpl.points_earned,
      t1.name as team1_name, t1.code as team1_code, t1.flag_url as team1_flag_url,
      t2.name as team2_name, t2.code as team2_code, t2.flag_url as team2_flag_url,
      t3.name as team3_name, t3.code as team3_code, t3.flag_url as team3_flag_url
     FROM group_predictions_lite gpl
     LEFT JOIN teams t1 ON t1.id = gpl.team1_id
     LEFT JOIN teams t2 ON t2.id = gpl.team2_id
     LEFT JOIN teams t3 ON t3.id = gpl.team3_id
     WHERE gpl.user_id = $1`,
    [userId]
  );

  const predictions = rows.map(r => ({
    groupName: r.group_name,
    team1: r.team1_id ? {
      id: r.team1_id,
      name: r.team1_name,
      code: r.team1_code,
      flagUrl: r.team1_flag_url
    } : null,
    team2: r.team2_id ? {
      id: r.team2_id,
      name: r.team2_name,
      code: r.team2_code,
      flagUrl: r.team2_flag_url
    } : null,
    team3: r.team3_id ? {
      id: r.team3_id,
      name: r.team3_name,
      code: r.team3_code,
      flagUrl: r.team3_flag_url
    } : null,
    pointsEarned: r.points_earned,
    isLocked: false // Group predictions are usually locked when group stage starts
  }));

  res.json({ success: true, data: { predictions } });
}
