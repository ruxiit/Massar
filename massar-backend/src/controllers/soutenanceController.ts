import type { Request, Response } from 'express';
import { createHash, randomBytes } from 'crypto';
import { supabase } from '../config/supabaseClient.js';
import type { Signature, Soutenance } from '../types/database.js';

// ---------------------------------------------------------------------------
// § PAdES mock constants
// ---------------------------------------------------------------------------

/**
 * Signing algorithm label embedded in the PAdES signature field.
 * In a real implementation this would reflect the actual key algorithm
 * (e.g. SHA256withRSA, SHA512withECDSA).
 */
const MOCK_ALGORITHM = 'SHA256withRSA';

/**
 * Required signing order for PV generation.
 * All roles in this list must have status = 'signed' for the dossier
 * to be promoted to 'pv_genere'.
 */
const REQUIRED_SIGNING_ROLES = ['president', 'examinateur', 'rapporteur'] as const;

// ---------------------------------------------------------------------------
// § Crypto helpers
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic SHA-256 fingerprint that simulates the hash of
 * the signed PDF at the moment of signing.
 *
 * Inputs:
 *   - dossier document_url  → simulates the PDF bytes
 *   - signer UUID           → simulates the signer's private key material
 *   - ISO timestamp         → ensures a unique hash per signing event
 *
 * In production this would be the actual SHA-256/SHA-512 digest of the
 * signed PDF bytes produced by the signing authority.
 */
function generateCryptographicHash(
  documentUrl: string,
  signerId: string,
  timestamp: string
): string {
  return createHash('sha256')
    .update(`${documentUrl}|${signerId}|${timestamp}`)
    .digest('hex');
}

/**
 * Generate a mock Base64-encoded DER signature value.
 * In a real PAdES flow this would be the PKCS#7/CMS structure returned
 * by the HSM or signing service.
 */
function generateSignatureValue(
  cryptographicHash: string,
  signerId: string
): string {
  // Combine the hash with a random nonce to simulate asymmetric encryption.
  const nonce = randomBytes(16).toString('hex');
  const raw = Buffer.from(`pades|${cryptographicHash}|${signerId}|${nonce}`);
  return raw.toString('base64');
}

// ---------------------------------------------------------------------------
// § Controller
// ---------------------------------------------------------------------------

/**
 * POST /api/soutenances/:id/sign-pades
 *
 * Mock PAdES digital signature endpoint.
 *
 * Flow:
 *   1. Validate the soutenance exists and links back to a dossier.
 *   2. Find or create a 'pending' signature row for this signer.
 *   3. Generate mock cryptographic hash + signature value.
 *   4. Update the signature row to 'signed'.
 *   5. Check if ALL required signers have signed.
 *   6. If yes → update dossier status to 'pv_genere'.
 *   7. Return detailed signing receipt.
 *
 * Body parameters:
 *   - signer_id (UUID)   : The jury member signing the PV.
 *   - signing_order (1-3): Position in the multi-signature chain.
 *   - reason (string?)   : Human-readable reason embedded in the PAdES field.
 *
 * Role access: directeur | departement (jury members)
 */
export async function signPades(req: Request, res: Response): Promise<void> {
  const soutenanceId = req.params['id'];
  const {
    signer_id,
    signing_order,
    reason = 'Validation du procès-verbal de soutenance',
  } = req.body as {
    signer_id?: string;
    signing_order?: number;
    reason?: string;
  };

  // ── Validate path param ─────────────────────────────────────────────────
  if (!soutenanceId) {
    res.status(400).json({ error: 'Bad Request', message: 'Soutenance ID manquant dans l\'URL.' });
    return;
  }

  // ── Validate body ───────────────────────────────────────────────────────
  if (!signer_id || typeof signer_id !== 'string') {
    res.status(400).json({
      error: 'Bad Request',
      message: '`signer_id` (UUID string) est requis.',
    });
    return;
  }

  if (
    signing_order === undefined ||
    !Number.isInteger(signing_order) ||
    signing_order < 1 ||
    signing_order > 10
  ) {
    res.status(400).json({
      error: 'Bad Request',
      message: '`signing_order` (entier ≥ 1) est requis.',
    });
    return;
  }

  // ── Fetch soutenance ────────────────────────────────────────────────────
  const { data: rawSoutenance, error: soutenanceError } = await supabase
    .from('soutenances')
    .select('*')
    .eq('id', soutenanceId)
    .single();

  if (soutenanceError || !rawSoutenance) {
    res.status(404).json({
      error: 'Not Found',
      message: `Soutenance '${soutenanceId}' introuvable.`,
    });
    return;
  }

  const soutenance = rawSoutenance as unknown as Soutenance;

  // ── Fetch associated dossier ────────────────────────────────────────────
  const { data: rawDossier, error: dossierError } = await supabase
    .from('dossiers')
    .select('*')
    .eq('id', soutenance.dossier_id)
    .single();

  if (dossierError || !rawDossier) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Impossible de récupérer le dossier associé à cette soutenance.',
    });
    return;
  }

  const dossier = rawDossier as Record<string, unknown>;
  const documentUrl = (typeof dossier['document_url'] === 'string' ? dossier['document_url'] : soutenanceId) as string;

  // ── Check for a pre-existing signature row for this signer ─────────────
  const { data: rawExisting } = await supabase
    .from('signatures')
    .select('*')
    .eq('dossier_id', soutenance.dossier_id)
    .eq('signer_id', signer_id)
    .single();

  const existingSignature = rawExisting as unknown as Signature | null;

  if (existingSignature?.status === 'signed') {
    res.status(409).json({
      error: 'Conflict',
      message: `Le signataire '${signer_id}' a déjà signé ce document.`,
      existing_signature: {
        id: existingSignature.id,
        signed_at: existingSignature.timestamp,
        cryptographic_hash: existingSignature.cryptographic_hash,
      },
    });
    return;
  }

  // ── Generate PAdES artefacts ────────────────────────────────────────────
  const signingTimestamp = new Date().toISOString();
  const signerIp =
    (typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for']
      : Array.isArray(req.headers['x-forwarded-for'])
      ? (req.headers['x-forwarded-for'][0] ?? '127.0.0.1')
      : null
    )?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    '127.0.0.1';

  const cryptographicHash = generateCryptographicHash(documentUrl, signer_id, signingTimestamp);
  const signatureValue = generateSignatureValue(cryptographicHash, signer_id);

  // ── Upsert the signature row ────────────────────────────────────────────
  let signatureId: string;

  if (existingSignature) {
    // Update the existing 'pending' row.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateSigError } = await (supabase as any)
      .from('signatures')
      .update({
        status: 'signed',
        timestamp: signingTimestamp,
        cryptographic_hash: cryptographicHash,
        signature_value: signatureValue,
        algorithm: MOCK_ALGORITHM,
        signer_ip: signerIp,
      })
      .eq('id', existingSignature.id);

    if (updateSigError) {
      console.error('[signPades] update signature error:', updateSigError.message);
      res.status(500).json({ error: 'Internal Server Error', message: 'Échec de la mise à jour de la signature.' });
      return;
    }

    signatureId = existingSignature.id;
  } else {
    // Insert a new 'signed' row directly (the signer signed in one step).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawInserted, error: insertSigError } = await (supabase as any)
      .from('signatures')
      .insert({
        dossier_id: soutenance.dossier_id,
        signer_id,
        signing_order,
        status: 'signed',
        reason,
      } as object)
      .select('id')
      .single();

    if (insertSigError || !rawInserted) {
      console.error('[signPades] insert signature error:', insertSigError?.message);
      res.status(500).json({ error: 'Internal Server Error', message: 'Échec de l\'enregistrement de la signature.' });
      return;
    }

    const inserted = rawInserted as unknown as { id: string };
    signatureId = inserted.id;

    // Also update the full signature fields now.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('signatures')
      .update({
        timestamp: signingTimestamp,
        cryptographic_hash: cryptographicHash,
        signature_value: signatureValue,
        algorithm: MOCK_ALGORITHM,
        signer_ip: signerIp,
      } as object)
      .eq('id', signatureId);
  }

  // ── Check if all required parties have signed ───────────────────────────
  const { data: rawAllSigs } = await supabase
    .from('signatures')
    .select('*')
    .eq('dossier_id', soutenance.dossier_id);

  const allSignatures = (rawAllSigs ?? []) as unknown as Signature[];
  const signedSigs = allSignatures.filter((s) => s.status === 'signed');

  // Quorum rule: every distinct signer in the signatures table must have signed.
  // (In a real system, required signers would be determined by the jury table.)
  const allSigned =
    signedSigs.length >= REQUIRED_SIGNING_ROLES.length &&
    allSignatures.every((s) => s.status === 'signed');

  let dossierStatusUpdated = false;

  if (allSigned) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: promotionError } = await (supabase as any)
      .from('dossiers')
      .update({ status: 'pv_genere' })
      .eq('id', soutenance.dossier_id);

    if (promotionError) {
      console.error('[signPades] dossier promotion error:', promotionError.message);
      // Non-fatal — the signature itself succeeded.
    } else {
      dossierStatusUpdated = true;
    }
  }

  // ── Return signing receipt ───────────────────────────────────────────────
  res.status(201).json({
    message: 'Signature PAdES appliquée avec succès.',
    receipt: {
      signature_id: signatureId,
      soutenance_id: soutenanceId,
      dossier_id: soutenance.dossier_id,
      signer_id,
      signing_order,
      algorithm: MOCK_ALGORITHM,
      cryptographic_hash: cryptographicHash,
      signature_value: signatureValue,
      reason,
      signer_ip: signerIp,
      signed_at: signingTimestamp,
    },
    chain_status: {
      total_signers: allSignatures.length + (existingSignature ? 0 : 1),
      signed_count: signedSigs.length + (existingSignature ? 0 : 1),
      all_signed: allSigned,
      dossier_status: dossierStatusUpdated
        ? 'pv_genere'
        : (dossier['status'] as string | undefined) ?? 'delibere',
    },
    compliance: {
      standard: 'ETSI EN 319 132 (PAdES Baseline-B Profile – Mock)',
      ltv_ready: true,
      audit_trail: `signature:${signatureId}@${signingTimestamp}`,
    },
  });
}

// ---------------------------------------------------------------------------
// § Bonus: GET /api/soutenances/:id/signatures
// Returns the full signature chain for a soutenance (audit view).
// ---------------------------------------------------------------------------

export async function getSignatureChain(req: Request, res: Response): Promise<void> {
  const soutenanceId = req.params['id'];

  if (!soutenanceId) {
    res.status(400).json({ error: 'Bad Request', message: 'Soutenance ID manquant.' });
    return;
  }

  const { data: rawSoutenance, error: soutenanceError } = await supabase
    .from('soutenances')
    .select('dossier_id')
    .eq('id', soutenanceId)
    .single();

  if (soutenanceError || !rawSoutenance) {
    res.status(404).json({ error: 'Not Found', message: `Soutenance '${soutenanceId}' introuvable.` });
    return;
  }

  const { dossier_id } = rawSoutenance as unknown as { dossier_id: string };

  const { data: rawSigs, error: sigsError } = await supabase
    .from('signatures')
    .select('*')
    .eq('dossier_id', dossier_id)
    .order('signing_order', { ascending: true });

  if (sigsError) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Erreur de récupération des signatures.' });
    return;
  }

  const signatures = (rawSigs ?? []) as unknown as Signature[];
  const allSigned = signatures.length > 0 && signatures.every((s) => s.status === 'signed');

  res.status(200).json({
    soutenance_id: soutenanceId,
    dossier_id,
    signatures: signatures.map((s) => ({
      id: s.id,
      signer_id: s.signer_id,
      signing_order: s.signing_order,
      status: s.status,
      algorithm: s.algorithm,
      cryptographic_hash: s.cryptographic_hash,
      signed_at: s.timestamp,
      reason: s.reason,
      signer_ip: s.signer_ip,
    })),
    chain_complete: allSigned,
  });
}
