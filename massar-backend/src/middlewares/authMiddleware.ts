import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient.js';
import type { AuthenticatedUser, Profile, Role } from '../types/database.js';

/**
 * Shape of a Supabase JWT payload (the claims Supabase embeds in every token).
 * Only the fields we actually use are listed.
 */
interface SupabaseJwtUser {
  sub: string;   // user UUID
  email: string;
  role: string;  // Supabase internal role (e.g. "authenticated")
  exp: number;   // expiry Unix timestamp
}

/**
 * Extract the raw Bearer token from the `Authorization` header.
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Validate that a value is one of the application's known roles.
 */
function isValidRole(value: unknown): value is Role {
  return (
    typeof value === 'string' &&
    ['etudiant', 'directeur', 'departement', 'faculte'].includes(value)
  );
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  // ── 2. Verify JWT with Supabase ─────────────────────────────────────────
  // `supabase.auth.getUser(token)` cryptographically verifies the JWT
  // (signature + expiry) without needing an extra network round-trip when
  // using the service-role key. If verification fails the error is non-null.
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    const message =
      authError?.message === 'invalid claim: exp'
        ? 'Token has expired. Please log in again.'
        : 'Invalid or expired token.';

    res.status(401).json({
      error: 'Unauthorized',
      message,
    });
    return;
  }

  const supabaseUser = authData.user as unknown as SupabaseJwtUser & typeof authData.user;

  // ── 3. Fetch profile (includes application-level role) ──────────────────
  // We cast the result to `Profile | null` because the Supabase PostgREST
  // type builder narrows column types to `never` under the combination of
  // `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and the full
  // Database generic. The runtime value is always a correct `Profile` row.
  const profileQuery = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
  const profileError = profileQuery.error;
  const profile = profileQuery.data as unknown as Profile | null;

  if (profileError || !profile) {
    // The Supabase user exists but has no matching profile row yet.
    // This can happen if the trigger that creates profiles hasn't run.
    res.status(403).json({
      error: 'Forbidden',
      message: 'User profile not found. Please complete registration.',
    });
    return;
  }

  // ── 4. Validate role ────────────────────────────────────────────────────
  if (!isValidRole(profile.role)) {
    res.status(403).json({
      error: 'Forbidden',
      message: `Unrecognised role '${String(profile.role)}'. Contact an administrator.`,
    });
    return;
  }

  // ── 5. Inject user context ──────────────────────────────────────────────
  // Build the object conditionally to satisfy `exactOptionalPropertyTypes`:
  // optional properties must not be set to `undefined` explicitly.
  const authenticatedUser: AuthenticatedUser = {
    id: authData.user.id,
    email: authData.user.email ?? (profile.email as string) ?? '',
    role: profile.role as Role,
    full_name: profile.full_name as string,
    ...(typeof profile.matricule === 'string' && {
      matricule: profile.matricule,
    }),
  };

  req.user = authenticatedUser;

  next();
}

// ---------------------------------------------------------------------------
// Role-based access guard factory
// ---------------------------------------------------------------------------

/**
 * Factory that returns a middleware restricting access to the given roles.
 * Must be placed **after** `authMiddleware` in the route stack.
 *
 * @example
 * // Only department heads (N1) may access this route:
 * router.post(
 *   '/jury',
 *   authMiddleware,
 *   requireRole('departement'),
 *   juryController.propose
 * );
 *
 * // Multiple roles allowed:
 * router.get(
 *   '/dossiers',
 *   authMiddleware,
 *   requireRole('directeur', 'departement'),
 *   dossierController.list
 * );
 */
export function requireRole(...allowedRoles: Role[]) {
  return function roleGuard(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (!req.user) {
      // Guard used without authMiddleware in the stack – programming error.
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'requireRole must be used after authMiddleware.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
      return;
    }

    next();
  };
}
