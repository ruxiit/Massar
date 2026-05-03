import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import {
  checkPlagiarism,
  getDossiers,
  uploadDossier,
  updateDossierStatus,
  withdrawDossier
} from '../controllers/dossierController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

console.log('[dossierRoutes] authMiddleware:', typeof authMiddleware);
console.log('[dossierRoutes] getDossiers:', typeof getDossiers);
console.log('[dossierRoutes] uploadDossier:', typeof uploadDossier);

// ---------------------------------------------------------------------------
// POST /api/dossiers/plagiarism-check
//
// Triggers a mock iThenticate similarity check on a submitted dossier.
// Returns a tiered verdict (approved / early_warning / high_risk) with
// actionable feedback when the score is above the 20% threshold.
//
// Accessible by: directeur (A2), departement (N1)
// ---------------------------------------------------------------------------
router.post(
  '/plagiarism-check',
  authMiddleware,
  requireRole('directeur', 'departement'),
  checkPlagiarism
);

// ---------------------------------------------------------------------------
// GET /api/dossiers
// ---------------------------------------------------------------------------
router.get(
  '/',
  authMiddleware,
  getDossiers
);

// ---------------------------------------------------------------------------
// POST /api/dossiers
// ---------------------------------------------------------------------------
router.post(
  '/',
  authMiddleware,
  requireRole('etudiant'),
  upload.single('file'),
  uploadDossier
);

// ---------------------------------------------------------------------------
// PATCH /api/dossiers/:id/status
// ---------------------------------------------------------------------------
router.patch(
  '/:id/status',
  authMiddleware,
  upload.single('pvFile'),
  updateDossierStatus
);

// ---------------------------------------------------------------------------
// DELETE /api/dossiers/:id
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authMiddleware,
  requireRole('etudiant'),
  withdrawDossier
);

export default router;
