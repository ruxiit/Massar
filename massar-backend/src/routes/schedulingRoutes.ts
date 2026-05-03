import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import { smartSuggest } from '../controllers/schedulingController.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/scheduling/smart-suggest?dossier_id=<uuid>
//
// Runs the smart scheduling algorithm:
//   1. Loads all room availability rows for the next 30 days.
//   2. Loads all jury members' busy windows from professor_schedules.
//   3. Scores every (room × slot × date) triple.
//   4. Returns the top-3 conflict-free (or least-conflicted) suggestions.
//
// Accessible by: departement (N1) only
// ---------------------------------------------------------------------------
router.get(
  '/smart-suggest',
  authMiddleware,
  requireRole('departement'),
  smartSuggest
);

export default router;
