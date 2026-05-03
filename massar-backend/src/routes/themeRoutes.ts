import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import {
  createTheme,
  getThemes,
  reviewTheme,
  deleteTheme,
} from '../controllers/themeController.js';

const router = Router();

// GET /api/themes — all roles (filtered by role in controller)
router.get('/', authMiddleware, getThemes);

// POST /api/themes — professors only
router.post('/', authMiddleware, requireRole('directeur'), createTheme);

// PATCH /api/themes/:id/review — admin only
router.patch('/:id/review', authMiddleware, requireRole('departement'), reviewTheme);

// DELETE /api/themes/:id — professor only (owns theme)
router.delete('/:id', authMiddleware, requireRole('directeur'), deleteTheme);

export default router;
