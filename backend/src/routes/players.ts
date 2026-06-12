import { Router } from 'express';
import { getPlayersByTeam, getPlayerById } from '../controllers/playersController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/team/:teamId', authMiddleware, getPlayersByTeam);
router.get('/:id', authMiddleware, getPlayerById);

export default router;
