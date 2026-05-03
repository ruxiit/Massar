import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import {
  requestSupervision,
  getMyRequests,
  getMyAcceptedRequest,
  reviewRequest,
} from '../controllers/supervisionController.js';

const router = Router();

// GET /api/supervision/my-requests — student & professor
router.get('/my-requests', authMiddleware, getMyRequests);

// GET /api/supervision/my-accepted — student only (used before dossier upload)
router.get('/my-accepted', authMiddleware, requireRole('etudiant'), getMyAcceptedRequest);

// POST /api/supervision/request — student only
router.post('/request', authMiddleware, requireRole('etudiant'), requestSupervision);

// PATCH /api/supervision/requests/:id/review — professor only
router.patch('/requests/:id/review', authMiddleware, requireRole('directeur'), reviewRequest);

export default router;
