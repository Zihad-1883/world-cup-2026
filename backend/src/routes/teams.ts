import { Router } from 'express';
import { getTeams, getTeamsByGroup, getTeamById } from '../controllers/teamsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getTeams);
router.get('/group/:groupName', getTeamsByGroup);

// Auth required
router.get('/:id', authMiddleware, getTeamById);

export default router;
