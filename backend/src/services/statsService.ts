import { query } from '../config/db';
import { TeamBasic } from '../types';

interface PopularPick {
  team: TeamBasic;
  pickCount: number;
  percentOfUsers: number;
}

interface PredictionStats {
  topPickedWinner: TeamBasic | null;
  popularPicks: PopularPick[];
  totalPredictors: number;
}

export async function getPredictionStats(): Promise<PredictionStats> {
  // Count unique predictors
  const totalRow = await query<{ count: string }>(
    'SELECT COUNT(DISTINCT user_id) AS count FROM predictions'
  );
  const totalPredictors = parseInt(totalRow[0]?.count ?? '0', 10);

  // Final round picks as "predicted winner"
  const rows = await query<Record<string, unknown>>(
    `SELECT
       t.id, t.name, t.code, t.group_name, t.group_position, t.flag_url, t.confederation,
       COUNT(p.id)::int AS pick_count
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     JOIN teams t ON p.predicted_winner_id = t.id
     WHERE m.round = 'FINAL'
     GROUP BY t.id, t.name, t.code, t.group_name, t.group_position, t.flag_url, t.confederation
     ORDER BY pick_count DESC`
  );

  if (!rows.length) {
    return { topPickedWinner: null, popularPicks: [], totalPredictors };
  }

  const popularPicks: PopularPick[] = rows.map((r) => ({
    team: {
      id: r.id as string,
      name: r.name as string,
      code: r.code as string,
      groupName: (r.group_name as string | null) ?? null,
      groupPosition: (r.group_position as number | null) ?? null,
      flagUrl: (r.flag_url as string | null) ?? null,
      confederation: (r.confederation as string | null) ?? null,
    },
    pickCount: r.pick_count as number,
    percentOfUsers: totalPredictors > 0
      ? Math.round(((r.pick_count as number) / totalPredictors) * 100)
      : 0,
  }));

  return {
    topPickedWinner: popularPicks[0].team,
    popularPicks,
    totalPredictors,
  };
}
