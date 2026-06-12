import { Request, Response } from 'express';
import { pool, query, queryOne } from '../config/db';
import { CommentWithReactions, ReactionType, UserPublic } from '../types';

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

async function buildComment(
  commentRow: Record<string, unknown>,
  userId?: string
): Promise<CommentWithReactions> {
  const commentId = commentRow.id as string;

  // Get reaction counts
  const counts = await query<{ type: string; count: string }>(
    'SELECT type, COUNT(*)::int AS count FROM comment_reactions WHERE comment_id = $1 GROUP BY type',
    [commentId]
  );
  const reactionCounts = { LIKE: 0, LOVE: 0 };
  for (const c of counts) reactionCounts[c.type as 'LIKE' | 'LOVE'] = parseInt(c.count, 10);

  // Get user reaction if logged in
  let userReaction: ReactionType | null = null;
  if (userId) {
    const ur = await queryOne<{ type: string }>(
      'SELECT type FROM comment_reactions WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );
    userReaction = (ur?.type as ReactionType) ?? null;
  }

  // Author
  const authorRow = await queryOne<Record<string, unknown>>(
    'SELECT id, email, username, avatar_url, role, prediction_mode, created_at FROM users WHERE id = $1',
    [commentRow.user_id as string]
  );

  return {
    id: commentId,
    userId: commentRow.user_id as string,
    matchId: (commentRow.match_id as string | null) ?? null,
    content: commentRow.content as string,
    createdAt: (commentRow.created_at as Date).toISOString(),
    updatedAt: (commentRow.updated_at as Date).toISOString(),
    author: toUserPublic(authorRow!),
    reactionCounts,
    userReaction,
    parentId: (commentRow.parent_id as string | null) ?? null,
  };
}

// GET /api/comments
export async function getComments(req: Request, res: Response): Promise<void> {
  const { matchId } = req.query as { matchId?: string };
  const userId = req.user?.userId;

  const conditions: string[] = [];
  const values: unknown[] = [];
  if (matchId) { conditions.push('match_id = $1'); values.push(matchId); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query<Record<string, unknown>>(
    `SELECT id, user_id, match_id, parent_id, content, created_at, updated_at FROM comments ${where} ORDER BY created_at DESC`,
    values
  );

  const comments = await Promise.all(rows.map((r) => buildComment(r, userId)));
  res.json({ success: true, data: { comments } });
}

// POST /api/comments
export async function postComment(req: Request, res: Response): Promise<void> {
  const { content, matchId, parentId } = req.body as { content?: string; matchId?: string; parentId?: string };
  const userId = req.user!.userId;

  if (!content || content.trim().length === 0) {
    res.status(400).json({ success: false, error: 'content is required' });
    return;
  }
  if (content.length > 500) {
    res.status(400).json({ success: false, error: 'content must be 500 characters or less' });
    return;
  }

  const rows = await query<Record<string, unknown>>(
    `INSERT INTO comments (user_id, match_id, parent_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, match_id, parent_id, content, created_at, updated_at`,
    [userId, matchId ?? null, parentId ?? null, content.trim()]
  );

  const comment = await buildComment(rows[0], userId);
  res.status(201).json({ success: true, data: { comment } });
}

// DELETE /api/comments/:id
export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const userId = req.user!.userId;
  const role = req.user!.role;

  const existing = await queryOne<{ user_id: string }>(
    'SELECT user_id FROM comments WHERE id = $1',
    [id]
  );
  if (!existing) { res.status(404).json({ success: false, error: 'Comment not found' }); return; }

  if (role !== 'ADMIN' && existing.user_id !== userId) {
    res.status(403).json({ success: false, error: 'Cannot delete another user\'s comment' });
    return;
  }

  await query('DELETE FROM comments WHERE id = $1', [id]);
  res.json({ success: true, data: null });
}

// POST /api/comments/:id/react
export async function reactToComment(req: Request, res: Response): Promise<void> {
  const { id: commentId } = req.params as { id: string };
  const { type } = req.body as { type?: ReactionType };
  const userId = req.user!.userId;

  if (!type || !['LIKE', 'LOVE'].includes(type)) {
    res.status(400).json({ success: false, error: 'type must be LIKE or LOVE' });
    return;
  }

  const client = await pool.connect();
  try {
    const existing = await client.query<{ id: string; type: string }>(
      'SELECT id, type FROM comment_reactions WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );

    let reaction = null;

    if (existing.rows.length) {
      if (existing.rows[0].type === type) {
        // Same type → toggle off (remove)
        await client.query('DELETE FROM comment_reactions WHERE id = $1', [existing.rows[0].id]);
      } else {
        // Different type → switch
        await client.query(
          'UPDATE comment_reactions SET type = $1 WHERE id = $2',
          [type, existing.rows[0].id]
        );
        const updated = await client.query<Record<string, unknown>>(
          'SELECT id, comment_id, user_id, type, created_at FROM comment_reactions WHERE id = $1',
          [existing.rows[0].id]
        );
        reaction = updated.rows[0];
      }
    } else {
      // New reaction
      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO comment_reactions (comment_id, user_id, type) VALUES ($1, $2, $3)
         RETURNING id, comment_id, user_id, type, created_at`,
        [commentId, userId, type]
      );
      reaction = inserted.rows[0];
    }

    // Get updated counts
    const counts = await client.query<{ type: string; count: string }>(
      'SELECT type, COUNT(*)::int AS count FROM comment_reactions WHERE comment_id = $1 GROUP BY type',
      [commentId]
    );
    const reactionCounts = { LIKE: 0, LOVE: 0 };
    for (const c of counts.rows) reactionCounts[c.type as 'LIKE' | 'LOVE'] = parseInt(c.count, 10);

    const formattedReaction = reaction ? {
      id: reaction.id as string,
      commentId: reaction.comment_id as string,
      userId: reaction.user_id as string,
      type: reaction.type as ReactionType,
      createdAt: (reaction.created_at as Date).toISOString(),
    } : null;

    res.json({ success: true, data: { reaction: formattedReaction, counts: reactionCounts } });
  } finally {
    client.release();
  }
}
