import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';
import { getUserRank } from '../services/leaderboardService';
import { UserPublic } from '../types';

function toUserPublic(row: Record<string, unknown>): UserPublic {
  return {
    id: row.id as string,
    email: row.email as string,
    username: row.username as string,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    role: row.role as 'USER' | 'ADMIN',
    predictionMode: (row.prediction_mode as string) as any,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

// GET /api/users/me
export async function getMe(req: Request, res: Response): Promise<void> {
  const row = await queryOne<Record<string, unknown>>(
    'SELECT id, email, username, avatar_url, role, prediction_mode, created_at FROM users WHERE id = $1',
    [req.user!.userId]
  );
  if (!row) { res.status(404).json({ success: false, error: 'User not found' }); return; }
  
  const { rank, totalPoints } = await getUserRank(req.user!.userId);
  
  res.json({ success: true, data: { user: toUserPublic(row), rank, totalPoints } });
}

// PATCH /api/users/me
export async function updateMe(req: Request, res: Response): Promise<void> {
  const { username, email } = req.body as { username?: string; email?: string };
  const userId = req.user!.userId;

  if (!username && !email) {
    res.status(400).json({ success: false, error: 'Provide username or email to update' });
    return;
  }

  // Check uniqueness against other users
  if (username) {
    const taken = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]
    );
    if (taken) { res.status(409).json({ success: false, error: 'Username already taken' }); return; }
  }
  if (email) {
    const taken = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), userId]
    );
    if (taken) { res.status(409).json({ success: false, error: 'Email already taken' }); return; }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (username) { fields.push(`username = $${i++}`); values.push(username); }
  if (email) { fields.push(`email = $${i++}`); values.push(email.toLowerCase()); }
  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const rows = await query<Record<string, unknown>>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, email, username, avatar_url, role, prediction_mode, created_at`,
    values
  );
  res.json({ success: true, data: { user: toUserPublic(rows[0]) } });
}

// PATCH /api/users/me/avatar
export async function updateAvatar(req: Request, res: Response): Promise<void> {
  const { avatarUrl } = req.body as { avatarUrl?: string };
  if (!avatarUrl) { res.status(400).json({ success: false, error: 'avatarUrl is required' }); return; }

  const rows = await query<Record<string, unknown>>(
    'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, username, avatar_url, role, prediction_mode, created_at',
    [avatarUrl, req.user!.userId]
  );
  res.json({ success: true, data: { user: toUserPublic(rows[0]) } });
}

// PATCH /api/users/me/mode
export async function updatePredictionMode(req: Request, res: Response): Promise<void> {
  const { mode } = req.body as { mode?: string };
  if (!mode || !['LITE', 'PRO', 'HYBRID'].includes(mode)) {
    res.status(400).json({ success: false, error: 'Invalid prediction mode' });
    return;
  }

  const rows = await query<Record<string, unknown>>(
    'UPDATE users SET prediction_mode = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, username, avatar_url, role, prediction_mode, created_at',
    [mode, req.user!.userId]
  );
  res.json({ success: true, data: { user: toUserPublic(rows[0]) } });
}

