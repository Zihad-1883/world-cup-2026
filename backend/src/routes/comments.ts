import { Router } from 'express';
import {
  getComments,
  postComment,
  deleteComment,
  reactToComment,
} from '../controllers/commentsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getComments);
router.post('/', authMiddleware, postComment);
router.delete('/:id', authMiddleware, deleteComment);
router.post('/:id/react', authMiddleware, reactToComment);

export default router;
