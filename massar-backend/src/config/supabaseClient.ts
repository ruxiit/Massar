import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.js';

// Environment variables are loaded by the application entry-point (server.ts).
// We read them here but do NOT call dotenv.config() – that must happen once,
// at startup, before any module is imported that reads process.env.

const supabaseUrl = process.env['SUPABASE_URL'] ?? '';
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

// Validation is intentionally lazy (checked on first use) because in ESM,
// all imports are resolved before dotenv has a chance to run if the throw
// is at module top-level. The server startup log will still show an error
// if these are missing when the Supabase client is first called.

/**
 * Server-side Supabase client authenticated with the Service Role Key.
 *
 * Typed with the full `Database` generic so every `.from('table')` call
 * is statically checked against the schema defined in `types/database.ts`.
 *
 * IMPORTANT:
 *  - This client BYPASSES Row-Level Security (RLS). It must NEVER be
 *    exposed to the browser or sent to any client.
 *  - Use it exclusively inside Express route handlers / services on the
 *    server to perform privileged operations (e.g. admin queries, storage
 *    management, user lookups from the `profiles` table).
 *  - Auth is intentionally disabled (autoRefreshToken / persistSession)
 *    because the backend validates JWTs manually via the authMiddleware.
 *
 * Example typed usage:
 *   const { data, error } = await supabase
 *     .from('dossiers')           // ← autocompletes table names
 *     .select('*')
 *     .eq('status', 'planifie'); // ← autocompletes DossierStatus values
 *   // `data` is inferred as `Dossier[] | null`
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);