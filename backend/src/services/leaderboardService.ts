import { query, queryOne } from '../config/db';

export async function getUserRank(userId: string): Promise<{ rank: number; totalPoints: number }> {
  // Common Table Expression for performance
  const sql = `
    WITH UserPoints AS (
      SELECT 
        u.id,
        u.username,
        (
          COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) +
          COALESCE((SELECT SUM(points_earned) FROM group_predictions_lite WHERE user_id = u.id), 0)
        ) as total_points
      FROM users u
    ),
    RankedUsers AS (
      SELECT 
        id, 
        total_points,
        RANK() OVER (ORDER BY total_points DESC, id ASC) as rank
      FROM UserPoints
    )
    SELECT rank, total_points FROM RankedUsers WHERE id = $1
  `;
  
  const result = await queryOne<{ rank: string; total_points: string }>(sql, [userId]);
  
  return {
    rank: parseInt(result?.rank ?? '0', 10),
    totalPoints: parseInt(result?.total_points ?? '0', 10)
  };
}

export async function getGlobalLeaderboard(limit = 10) {
    const sql = `
    WITH UserPoints AS (
      SELECT 
        u.id,
        u.username,
        u.avatar_url,
        (
          COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) +
          COALESCE((SELECT SUM(points_earned) FROM group_predictions_lite WHERE user_id = u.id), 0)
        ) as total_points
      FROM users u
    )
    SELECT username, avatar_url, total_points
    FROM UserPoints
    ORDER BY total_points DESC, username ASC
    LIMIT $1
  `;
  const rows = await query<Record<string, any>>(sql, [limit]);
  return rows;
}
