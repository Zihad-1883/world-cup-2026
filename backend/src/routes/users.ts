import { Router } from 'express';
import { getMe, updateMe, updateAvatar, updatePredictionMode } from '../controllers/usersController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.patch('/me/avatar', authMiddleware, updateAvatar);
router.patch('/me/mode', authMiddleware, updatePredictionMode);

export default router;

