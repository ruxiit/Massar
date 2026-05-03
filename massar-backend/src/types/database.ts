// ============================================================
// R5 Soutenance Workflow – Database Types
// ============================================================
// This file defines:
//   1. Domain enums (Role, DossierStatus, SignatureStatus)
//   2. Row interfaces for every table in the database
//   3. The top-level `Database` generic consumed by the typed
//      Supabase client (`SupabaseClient<Database>`).
//
// Strict rules applied throughout:
//   - All UUID columns are `string`
//   - All timestamps are ISO-8601 strings (`string`)
//   - Optional DB columns carry `| null` (exactOptionalPropertyTypes)
//   - Insert / Update row types omit server-generated fields
// ============================================================

// ------------------------------------------------------------------
// § 1  ENUMS
// ------------------------------------------------------------------

/**
 * All user roles in the system.
 *
 * Actor mapping (R5 Soutenance workflow):
 *   A1  → 'etudiant'     (student who submits the dossier)
 *   A2  → 'directeur'    (thesis director who validates the dossier)
 *   N1  → 'departement'  (department head who manages jury & schedule)
 *
 * Additional administrative actors:
 *   'faculte'            (faculty-level oversight / PV archiving)
 */
export type Role = 'etudiant' | 'directeur' | 'departement' | 'faculte';

/** Status lifecycle for a professor's research theme. */
export type ThemeStatus = 'pending_admin' | 'approved' | 'rejected';

/** Status lifecycle for a student supervision request. */
export type SupervisionStatus = 'pending' | 'accepted' | 'rejected';

/** Convenience aliases that map workflow actor codes to concrete roles. */
export type ActorA1 = 'etudiant';
export type ActorA2 = 'directeur';
export type ActorN1 = 'departement';

/**
 * The ordered status lifecycle for an R5 Soutenance dossier.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  depose → progres_verifie → plagiat_verifie             │
 * │         → jury_propose → planifie → delibere            │
 * │         → pv_genere → archive                           │
 * └─────────────────────────────────────────────────────────┘
 */
export type DossierStatus =
  | 'depose'           // A1: Student submits the dossier
  | 'progres_verifie'  // A2: Director verifies thesis progress report
  | 'plagiat_verifie'  // N1: Anti-plagiarism check passed
  | 'jury_propose'     // N1: Jury composition proposed
  | 'planifie'         // N1: Defence date & room scheduled
  | 'delibere'         // Jury: Deliberation result recorded
  | 'pv_genere'        // N1/System: Official PV document generated
  | 'archive'           // System: Dossier permanently archived
  | 'rejected';        // Student must re-deposit (Triggered by director rejection)

/**
 * Lifecycle states for a PAdES digital signature.
 *
 *   pending   – signature request created, awaiting the signer's action
 *   signed    – cryptographic signature successfully applied & verified
 *   rejected  – signer explicitly refused to sign
 *   revoked   – signature was invalidated after the fact (e.g. key compromise)
 */
export type SignatureStatus = 'pending' | 'signed' | 'rejected' | 'revoked';

// ------------------------------------------------------------------
// § 2  ROW INTERFACES
// ------------------------------------------------------------------

// ── profiles ──────────────────────────────────────────────────────

/**
 * Represents a row in the `profiles` table.
 * Linked 1-to-1 with `auth.users` via the `id` column.
 */
export interface Profile {
  /** UUID – mirrors auth.users.id */
  id: string;
  role: Role;
  full_name: string;
  /** Student matriculation number (only for 'etudiant' role) */
  matricule: string | null;
  email: string | null;
  created_at: string;
  updated_at: string | null;
}

// ── themes ──────────────────────────────────────────────────────────

/**
 * Represents a row in the `themes` table.
 * Created by a professor (directeur), then reviewed by admin (departement).
 */
export interface Theme {
  id: string;
  /** FK → profiles.id (must have role 'directeur') */
  professor_id: string;
  /** Short title for the research theme */
  title: string;
  /** Detailed description of the research theme */
  description: string;
  /** Academic speciality (e.g. "ماستر ذكاء اصطناعي") */
  speciality: string | null;
  /** Maximum number of students allowed (default 1) */
  max_students: number;
  /** Administrative review status */
  status: ThemeStatus;
  /** Feedback from admin when rejecting */
  admin_feedback: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ThemeInsert {
  professor_id: string;
  title: string;
  description: string;
  speciality?: string | null;
  max_students?: number;
  status?: ThemeStatus;
  admin_feedback?: string | null;
}

export interface ThemeUpdate {
  title?: string;
  description?: string;
  speciality?: string | null;
  max_students?: number;
  status?: ThemeStatus;
  admin_feedback?: string | null;
}

// ── supervision_requests ──────────────────────────────────────────────────────

/**
 * Represents a row in the `supervision_requests` table.
 * A student sends a request to a professor via an approved theme.
 */
export interface SupervisionRequest {
  id: string;
  /** FK → profiles.id (etudiant) */
  student_id: string;
  /** FK → themes.id */
  theme_id: string;
  /** FK → profiles.id (directeur) — denormalized for convenience */
  professor_id: string;
  /** Current status of the request */
  status: SupervisionStatus;
  /** Message from student to professor */
  student_message: string | null;
  /** Professor's feedback/reason for rejection */
  professor_feedback: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SupervisionRequestInsert {
  student_id: string;
  theme_id: string;
  professor_id: string;
  status?: SupervisionStatus;
  student_message?: string | null;
  professor_feedback?: string | null;
}

export interface SupervisionRequestUpdate {
  status?: SupervisionStatus;
  professor_feedback?: string | null;
}

export interface ProfileInsert {
  id: string;
  role: Role;
  full_name: string;
  matricule?: string | null;
  email?: string | null;
}

export interface ProfileUpdate {
  role?: Role;
  full_name?: string;
  matricule?: string | null;
  email?: string | null;
}

// ── dossiers ──────────────────────────────────────────────────────

/**
 * Represents a row in the `dossiers` table.
 * Central entity of the R5 workflow.
 */
export interface Dossier {
  /** UUID primary key */
  id: string;
  /** FK → profiles.id (student / A1) */
  student_id: string;
  /** FK → profiles.id (thesis director / A2) */
  director_id: string | null;
  /** Public storage URL for the thesis document */
  document_url: string;
  /** Short abstract / summary of the thesis */
  resume: string;
  /** Current lifecycle status */
  status: DossierStatus;
  /** Plagiarism similarity score [0–100], set after 'plagiat_verifie' */
  plagiarism_score: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface DossierInsert {
  student_id: string;
  director_id?: string | null;
  document_url: string;
  resume: string;
  status?: DossierStatus;
  plagiarism_score?: number | null;
  /** FK → themes.id – linked research theme */
  theme_id?: string | null;
  /** FK → supervision_requests.id – the accepted supervision request */
  supervision_request_id?: string | null;
}

export interface DossierUpdate {
  director_id?: string | null;
  document_url?: string;
  resume?: string;
  status?: DossierStatus;
  plagiarism_score?: number | null;
  theme_id?: string | null;
  supervision_request_id?: string | null;
}

// ── jury ──────────────────────────────────────────────────────────

/**
 * Proposed jury members for a dossier.
 * Inserted by N1 when transitioning to 'jury_propose'.
 */
export interface Jury {
  id: string;
  /** FK → dossiers.id */
  dossier_id: string;
  /** FK → profiles.id */
  president_id: string;
  /** FK → profiles.id */
  examinateur_id: string;
  /** FK → profiles.id (thesis director may act as rapporteur) */
  rapporteur_id: string | null;
  created_at: string;
}

export interface JuryInsert {
  dossier_id: string;
  president_id: string;
  examinateur_id: string;
  rapporteur_id?: string | null;
}

export interface JuryUpdate {
  president_id?: string;
  examinateur_id?: string;
  rapporteur_id?: string | null;
}

// ── soutenances ───────────────────────────────────────────────────

/**
 * Represents a row in the `soutenances` table.
 * Created / updated by N1 when scheduling the defence ('planifie').
 */
export interface Soutenance {
  id: string;
  /** FK → dossiers.id */
  dossier_id: string;
  /** ISO 8601 date-time string for the defence */
  date_soutenance: string | null;
  /** Room / hall where the defence takes place */
  salle: string | null;
  /** FK → profiles.id – jury president */
  president_id: string | null;
  /** FK → profiles.id – jury examiner */
  examinateur_id: string | null;
  /** Public storage URL for the generated PV document */
  pv_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SoutenanceInsert {
  dossier_id: string;
  date_soutenance?: string | null;
  salle?: string | null;
  president_id?: string | null;
  examinateur_id?: string | null;
  pv_url?: string | null;
}

export interface SoutenanceUpdate {
  date_soutenance?: string | null;
  salle?: string | null;
  president_id?: string | null;
  examinateur_id?: string | null;
  pv_url?: string | null;
}

// ── deliberations ─────────────────────────────────────────────────

/**
 * Deliberation outcome recorded after the defence.
 * Transitions the dossier to 'delibere'.
 */
export interface Deliberation {
  id: string;
  /** FK → soutenances.id */
  soutenance_id: string;
  /** Numeric grade (e.g. 0–20 on Algerian scale) */
  note: number;
  /** Mention awarded (Passable, Assez Bien, Bien, Très Bien, Excellent) */
  mention: string | null;
  /** Free-text observations by the jury */
  observations: string | null;
  created_at: string;
}

export interface DeliberationInsert {
  soutenance_id: string;
  note: number;
  mention?: string | null;
  observations?: string | null;
}

export interface DeliberationUpdate {
  note?: number;
  mention?: string | null;
  observations?: string | null;
}

// ------------------------------------------------------------------
// § 3  SMART SCHEDULING  (Innovation layer)
// ------------------------------------------------------------------

/**
 * Represents a row in the `room_availability` table.
 *
 * Purpose: enable the N1 actor (département) to query which rooms are
 * free on a given date / time slot before scheduling a soutenance,
 * avoiding double-booking conflicts automatically.
 *
 * `time_slots` is a JSONB array of objects with the shape:
 *   { start: "HH:MM", end: "HH:MM", is_booked: boolean }
 *
 * This allows fine-grained, sub-day availability queries without
 * storing one row per slot.
 */
export interface TimeSlot {
  /** "HH:MM" in 24-h format */
  start: string;
  /** "HH:MM" in 24-h format */
  end: string;
  /** True when this slot has already been reserved */
  is_booked: boolean;
  /** FK → soutenances.id – set when is_booked = true */
  soutenance_id: string | null;
}

export interface RoomAvailability {
  id: string;
  /** Room / hall identifier (e.g. "Amphi A", "Salle 12") */
  salle: string;
  /** ISO 8601 date string "YYYY-MM-DD" */
  date: string;
  /**
   * JSONB column – array of time-slot objects for the day.
   * Typed as `TimeSlot[]` for full compile-time safety.
   */
  time_slots: TimeSlot[];
  /** Maximum simultaneous defences the room can host */
  capacity: number;
  created_at: string;
  updated_at: string | null;
}

export interface RoomAvailabilityInsert {
  salle: string;
  date: string;
  time_slots?: TimeSlot[];
  capacity?: number;
}

export interface RoomAvailabilityUpdate {
  time_slots?: TimeSlot[];
  capacity?: number;
}

/**
 * Represents a row in the `professor_schedules` table.
 *
 * Purpose: track per-professor busy/free windows so the Smart
 * Scheduler can automatically suggest conflict-free jury assignments.
 *
 * A professor (directeur / departement) can have multiple schedule
 * rows per week – one per busy window.
 */
export interface ProfessorSchedule {
  id: string;
  /** FK → profiles.id (must have role 'directeur' or 'departement') */
  professor_id: string;
  /** ISO 8601 date string "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" start of busy window */
  busy_from: string;
  /** "HH:MM" end of busy window */
  busy_until: string;
  /**
   * Reason for unavailability (e.g. "cours", "réunion", "soutenance").
   * Helps the scheduler display human-readable conflict reasons.
   */
  reason: string | null;
  /** FK → soutenances.id – set when the block is created by scheduling */
  soutenance_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProfessorScheduleInsert {
  professor_id: string;
  date: string;
  busy_from: string;
  busy_until: string;
  reason?: string | null;
  soutenance_id?: string | null;
}

export interface ProfessorScheduleUpdate {
  busy_from?: string;
  busy_until?: string;
  reason?: string | null;
  soutenance_id?: string | null;
}

// ------------------------------------------------------------------
// § 4  PADES DIGITAL SIGNATURES  (Technical Complexity layer)
// ------------------------------------------------------------------

/**
 * Represents a row in the `signatures` table.
 *
 * Each row records a single PAdES (PDF Advanced Electronic Signature)
 * applied to a dossier by an authorised signer.
 *
 * The `cryptographic_hash` column stores the SHA-256 / SHA-512 digest
 * of the signed document at the moment of signing.  This acts as an
 * immutable audit trail: even if the stored document is later modified,
 * the hash mismatch exposes the tampering.
 *
 * Workflow integration:
 *   - The system creates a 'pending' row when a signature is requested.
 *   - The signing service (e.g. DocuSign, Yousign, or in-house) updates
 *     the row to 'signed' + writes `signature_value` and `timestamp`.
 *   - Status 'rejected' / 'revoked' terminates the signature chain.
 */
export interface Signature {
  id: string;
  /** FK → dossiers.id – the document being signed */
  dossier_id: string;
  /** FK → profiles.id – the person who must / did sign */
  signer_id: string;
  /**
   * ISO 8601 timestamp of when the signature was applied.
   * NULL while status = 'pending'.
   */
  timestamp: string | null;
  /**
   * Hex-encoded cryptographic hash (SHA-256 or SHA-512) of the
   * signed PDF at the moment of signing.
   * NULL while status = 'pending'.
   */
  cryptographic_hash: string | null;
  /**
   * Base64-encoded DER/PEM signature value produced by the signing
   * authority.  Stored for long-term validation (LTV – Long Term
   * Validation) per ETSI EN 319 132 (PAdES baseline profile).
   * NULL while status = 'pending'.
   */
  signature_value: string | null;
  /**
   * Algorithm used, e.g. "SHA256withRSA", "SHA512withECDSA".
   * Recorded so future validators know which algorithm to use.
   */
  algorithm: string | null;
  /** Current lifecycle state of this signature instance */
  status: SignatureStatus;
  /**
   * Signing order within the multi-signature chain (1-based).
   * Example: student signs first (1), director second (2),
   * department head last (3).
   */
  signing_order: number;
  /**
   * Reason text embedded in the PAdES signature field
   * (e.g. "Validation du dossier de soutenance").
   */
  reason: string | null;
  /** IP address of the signer at the time of signing (audit) */
  signer_ip: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SignatureInsert {
  dossier_id: string;
  signer_id: string;
  signing_order: number;
  status?: SignatureStatus;
  reason?: string | null;
}

export interface SignatureUpdate {
  timestamp?: string | null;
  cryptographic_hash?: string | null;
  signature_value?: string | null;
  algorithm?: string | null;
  status?: SignatureStatus;
  signer_ip?: string | null;
}

// ------------------------------------------------------------------
// § 5  SUPABASE DATABASE GENERIC
// ------------------------------------------------------------------

/**
 * Top-level `Database` type consumed by `SupabaseClient<Database>`.
 *
 * Usage:
 *   import { createClient } from '@supabase/supabase-js';
 *   import type { Database } from '../types/database.js';
 *   const supabase = createClient<Database>(url, key);
 *
 * This gives full type inference on `.from('table_name')` calls:
 *   supabase.from('dossiers').select(...)  ← typed as Dossier[]
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      dossiers: {
        Row: Dossier;
        Insert: DossierInsert;
        Update: DossierUpdate;
      };
      jury: {
        Row: Jury;
        Insert: JuryInsert;
        Update: JuryUpdate;
      };
      soutenances: {
        Row: Soutenance;
        Insert: SoutenanceInsert;
        Update: SoutenanceUpdate;
      };
      deliberations: {
        Row: Deliberation;
        Insert: DeliberationInsert;
        Update: DeliberationUpdate;
      };
      room_availability: {
        Row: RoomAvailability;
        Insert: RoomAvailabilityInsert;
        Update: RoomAvailabilityUpdate;
      };
      professor_schedules: {
        Row: ProfessorSchedule;
        Insert: ProfessorScheduleInsert;
        Update: ProfessorScheduleUpdate;
      };
      signatures: {
        Row: Signature;
        Insert: SignatureInsert;
        Update: SignatureUpdate;
      };
      themes: {
        Row: Theme;
        Insert: ThemeInsert;
        Update: ThemeUpdate;
      };
      supervision_requests: {
        Row: SupervisionRequest;
        Insert: SupervisionRequestInsert;
        Update: SupervisionRequestUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role: Role;
      dossier_status: DossierStatus;
      signature_status: SignatureStatus;
      theme_status: ThemeStatus;
      supervision_status: SupervisionStatus;
    };
  };
}

// ── notifications ──────────────────────────────────────────────────

/**
 * Represents a row in the `notifications` table.
 * Used for real-time alerts across all user roles.
 */
export interface Notification {
  id: string;
  /** FK → profiles.id (recipient) */
  user_id: string;
  /** Short title of the notification */
  title: string;
  /** Detailed content / message */
  content: string;
  /** Type of notification for icon/styling: 'info' | 'success' | 'warning' | 'error' */
  type: 'info' | 'success' | 'warning' | 'error';
  /** Optional URL to navigate to when clicked */
  link: string | null;
  /** Read status */
  is_read: boolean;
  created_at: string;
}

export interface NotificationInsert {
  user_id: string;
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
  is_read?: boolean;
}

export interface NotificationUpdate {
  is_read?: boolean;
}

// ------------------------------------------------------------------
// § 6  AUTHENTICATED REQUEST CONTEXT
// ------------------------------------------------------------------

/**
 * Shape of the user object injected into Express's `req` object
 * by the `authMiddleware` after successful JWT verification.
 */
export interface AuthenticatedUser {
  /** Supabase user UUID */
  id: string;
  email: string;
  role: Role;
  full_name: string;
  matricule?: string;
}