import { Router } from 'express';
import {
  submitPredictions,
  getMyPredictions,
  getMyAccuracy,
  getStats,
} from '../controllers/predictionsController';
import { submitLitePredictions, getMyLitePredictions } from '../controllers/litePredictionsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/stats', getStats);

// Protected
router.post('/', authMiddleware, submitPredictions);
router.get('/me', authMiddleware, getMyPredictions);
router.get('/me/accuracy', authMiddleware, getMyAccuracy);

// Lite Mode
router.post('/lite/groups', authMiddleware, submitLitePredictions);
router.get('/lite/me', authMiddleware, getMyLitePredictions);

export default router;

