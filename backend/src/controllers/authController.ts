import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../config/db';
import {
  signAccessToken,
  verifyAccessToken,
  getRefreshTokenExpiryDate,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from '../config/auth';
import { UserPublic } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function toUserPublic(row: Record<string, unknown>): UserPublic {
  return {
    id: row.id as string,
    email: row.email as string,
    username: row.username as string,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    role: row.role as 'USER' | 'ADMIN',
    predictionMode: (row.prediction_mode as any) || 'PRO',
    createdAt: (row.created_at as Date).toISOString(),
  };
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, username, avatarUrl } = req.body as {
    email?: string;
    password?: string;
    username?: string;
    avatarUrl?: string;
  };

  if (!email || !password || !username) {
    res.status(400).json({ success: false, error: 'email, password and username are required' });
    return;
  }

  // Check uniqueness
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email.toLowerCase(), username]
  );
  if (existing) {
    res.status(409).json({ success: false, error: 'Email or username already taken' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);

  const rows = await query<Record<string, unknown>>(
    `INSERT INTO users (email, username, password_hash, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, username, avatar_url, role, prediction_mode, created_at`,
    [email.toLowerCase(), username, password_hash, avatarUrl || null]
  );
  const user = toUserPublic(rows[0]);

  // Issue tokens
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
  const refreshToken = uuidv4();
  const expiresAt = getRefreshTokenExpiryDate();

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt]
  );

  setRefreshCookie(res, refreshToken);
  res.status(201).json({ success: true, data: { user, token: accessToken } });
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'email and password are required' });
    return;
  }

  const row = await queryOne<Record<string, unknown>>(
    'SELECT id, email, username, password_hash, avatar_url, role, prediction_mode, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (!row) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, row.password_hash as string);
  if (!valid) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  const user = toUserPublic(row);

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
  const refreshToken = uuidv4();
  const expiresAt = getRefreshTokenExpiryDate();

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt]
  );

  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, token: accessToken } });
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const row = await queryOne<Record<string, unknown>>(
    'SELECT id, email, username, avatar_url, role, prediction_mode, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (!row) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({ success: true, data: { user: toUserPublic(row) } });
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

  if (!token) {
    res.status(401).json({ success: false, error: 'Refresh token missing' });
    return;
  }

  const rtRow = await queryOne<Record<string, unknown>>(
    'SELECT rt.user_id, rt.expires_at, u.email, u.username, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = $1',
    [token]
  );

  if (!rtRow) {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
    return;
  }

  const expiresAt = new Date(rtRow.expires_at as string);
  if (expiresAt < new Date()) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    res.clearCookie(REFRESH_COOKIE_NAME);
    res.status(401).json({ success: false, error: 'Refresh token expired' });
    return;
  }

  const accessToken = signAccessToken({
    userId: rtRow.user_id as string,
    email: rtRow.email as string,
    username: rtRow.username as string,
    role: rtRow.role as 'USER' | 'ADMIN',
  });

  res.json({ success: true, data: { token: accessToken } });
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

  if (token) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  res.clearCookie(REFRESH_COOKIE_NAME);
  res.json({ success: true, data: null });
}
