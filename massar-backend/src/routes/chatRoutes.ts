import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getMessages, sendMessage } from '../controllers/chatController.js';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// GET  /api/chat/:supervision_request_id  — fetch all messages
router.get('/:supervision_request_id', getMessages);

// POST /api/chat/:supervision_request_id  — send a message
router.post('/:supervision_request_id', sendMessage);

export default router;
