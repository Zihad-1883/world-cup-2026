import { Router, Request, Response } from 'express';
import {
  getMatches,
  getMatchesByRound,
  getMatchById,
  updateMatchResult,
  lockMatch,
} from '../controllers/matchesController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { syncLiveMatches } from '../services/syncService';

const router = Router();

// Public
router.get('/', getMatches);
router.get('/round/:round', getMatchesByRound);

// Admin: sync — must come BEFORE /:id to avoid conflict
router.post('/sync-live', authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
  const result = await syncLiveMatches();
  res.json({ success: true, data: result });
});

// Auth required
router.get('/:id', authMiddleware, getMatchById);

// Admin
router.patch('/:id/result', authMiddleware, adminMiddleware, updateMatchResult);
router.patch('/:id/lock', authMiddleware, adminMiddleware, lockMatch);

export default router;
