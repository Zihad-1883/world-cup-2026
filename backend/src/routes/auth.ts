import { Router } from 'express';
import { register, login, me, refresh, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

export default router;
