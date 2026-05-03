import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import { signPades, getSignatureChain } from '../controllers/soutenanceController.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/soutenances/:id/sign-pades
//
// Simulates a PAdES digital signature on the soutenance PV document.
//   - Generates a SHA-256 cryptographic hash of the (simulated) PDF.
//   - Generates a mock Base64-encoded DER signature value.
//   - Writes/updates the `signatures` table row for this signer.
//   - If ALL required jury members have signed → promotes dossier to 'pv_genere'.
//
// Accessible by: directeur (jury rapporteur), departement (jury president/examiner)
// ---------------------------------------------------------------------------
router.post(
  '/:id/sign-pades',
  authMiddleware,
  requireRole('directeur', 'departement'),
  signPades
);

// ---------------------------------------------------------------------------
// GET /api/soutenances/:id/signatures
//
// Returns the full PAdES signature chain for audit and verification purposes.
// Includes cryptographic hashes, algorithm, IP addresses, and timestamps.
//
// Accessible by: directeur | departement | faculte
// ---------------------------------------------------------------------------
router.get(
  '/:id/signatures',
  authMiddleware,
  requireRole('directeur', 'departement', 'faculte'),
  getSignatureChain
);

export default router;
