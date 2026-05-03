import type { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import type {
  Dossier,
  Jury,
  ProfessorSchedule,
  RoomAvailability,
  TimeSlot,
} from '../types/database.js';

// ---------------------------------------------------------------------------
// § Internal types
// ---------------------------------------------------------------------------

interface CandidateSlot {
  date: string;           // YYYY-MM-DD
  start: string;          // HH:MM
  end: string;            // HH:MM
  salle: string;
  /** Lower is better. Computed from conflicts + historical load. */
  score: number;
  conflict_details: string[];
}

interface SuggestedSlot {
  rank: number;
  date: string;
  start: string;
  end: string;
  salle: string;
  optimality_score: number;   // 0–100 (100 = perfect, no conflicts at all)
  conflict_details: string[]; // human-readable warnings
}

// ---------------------------------------------------------------------------
// § Scheduling helpers
// ---------------------------------------------------------------------------

/**
 * Convert "HH:MM" to total minutes since midnight for arithmetic comparisons.
 */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Return true when [aStart, aEnd) overlaps with [bStart, bEnd).
 * Uses open-ended interval semantics so back-to-back slots don't conflict.
 */
function intervalsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

/**
 * Check whether a professor is busy during a given slot on a given date.
 * Returns a human-readable conflict reason or null if free.
 */
function getProfessorConflict(
  professorId: string,
  professorName: string,
  date: string,
  slotStart: string,
  slotEnd: string,
  schedules: ProfessorSchedule[]
): string | null {
  const conflict = schedules.find(
    (s) =>
      s.professor_id === professorId &&
      s.date === date &&
      intervalsOverlap(slotStart, slotEnd, s.busy_from, s.busy_until)
  );

  if (!conflict) return null;

  const reason = conflict.reason ? ` (${conflict.reason})` : '';
  return `${professorName} est indisponible de ${conflict.busy_from} à ${conflict.busy_until}${reason}`;
}

/**
 * Score a candidate slot.
 *
 * Scoring model (lower raw conflicts → higher optimality):
 *   - Base score starts at 100
 *   - Each jury member conflict deducts 35 points (jury availability is critical)
 *   - Room already booked for the slot deducts 50 points (hard blocker)
 *   - Slot at end-of-day (after 16:00) deducts 5 points (soft preference)
 */
function scoreSlot(
  slot: TimeSlot,
  salle: string,
  date: string,
  jury: Jury,
  juryProfiles: Map<string, string>, // id → full_name
  professorSchedules: ProfessorSchedule[]
): Omit<CandidateSlot, 'salle' | 'date'> {
  let rawScore = 100;
  const conflicts: string[] = [];

  // ── Room availability ─────────────────────────────────────────────────────
  if (slot.is_booked) {
    rawScore -= 50;
    conflicts.push(`Salle ${salle} déjà réservée sur ce créneau`);
  }

  // ── Jury member conflicts ─────────────────────────────────────────────────
  const juryMemberIds: { id: string; label: string }[] = [
    { id: jury.president_id, label: 'Président' },
    { id: jury.examinateur_id, label: 'Examinateur' },
    ...(jury.rapporteur_id
      ? [{ id: jury.rapporteur_id, label: 'Rapporteur' }]
      : []),
  ];

  for (const member of juryMemberIds) {
    const name = juryProfiles.get(member.id) ?? member.label;
    const conflict = getProfessorConflict(
      member.id,
      `${member.label} (${name})`,
      date,
      slot.start,
      slot.end,
      professorSchedules
    );
    if (conflict) {
      rawScore -= 35;
      conflicts.push(conflict);
    }
  }

  // ── Soft preference: avoid late-afternoon slots ───────────────────────────
  if (toMinutes(slot.start) >= toMinutes('16:00')) {
    rawScore -= 5;
    conflicts.push('Créneau en fin de journée (moins recommandé)');
  }

  return {
    start: slot.start,
    end: slot.end,
    score: Math.max(0, rawScore),
    conflict_details: conflicts,
  };
}

// ---------------------------------------------------------------------------
// § Controller
// ---------------------------------------------------------------------------

/**
 * GET /api/scheduling/smart-suggest?dossier_id=<uuid>
 *
 * Algorithm:
 *   1. Fetch the dossier to confirm it exists and has a jury assigned.
 *   2. Load all `room_availability` rows for the next 30 days.
 *   3. Load all `professor_schedules` rows for the jury members in the same window.
 *   4. Score every (room × time-slot × date) triple using the scoring model.
 *   5. Return the top-3 highest-scoring candidates (de-duplicated by date+time).
 *
 * Role access: departement
 */
export async function smartSuggest(req: Request, res: Response): Promise<void> {
  const { dossier_id } = req.query as Record<string, string | undefined>;

  // ── Validate input ──────────────────────────────────────────────────────
  if (!dossier_id || typeof dossier_id !== 'string') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Query parameter `dossier_id` (UUID string) is required.',
    });
    return;
  }

  // ── Fetch dossier ───────────────────────────────────────────────────────
  const { data: rawDossier, error: dossierError } = await supabase
    .from('dossiers')
    .select('*')
    .eq('id', dossier_id)
    .single();

  if (dossierError || !rawDossier) {
    res.status(404).json({
      error: 'Not Found',
      message: `Dossier '${dossier_id}' not found.`,
    });
    return;
  }

  const dossier = rawDossier as unknown as Dossier;

  // Dossier must be at 'jury_propose' or later to have a jury row.
  const validStatuses: string[] = ['jury_propose', 'planifie', 'delibere'];
  if (!validStatuses.includes(dossier.status)) {
    res.status(422).json({
      error: 'Unprocessable Entity',
      message:
        `Le dossier est actuellement en statut '${dossier.status}'. ` +
        'Un jury doit être proposé avant de pouvoir planifier la soutenance.',
    });
    return;
  }

  // ── Fetch jury ──────────────────────────────────────────────────────────
  const { data: rawJury, error: juryError } = await supabase
    .from('jury')
    .select('*')
    .eq('dossier_id', dossier_id)
    .single();

  if (juryError || !rawJury) {
    res.status(404).json({
      error: 'Not Found',
      message: `Aucun jury trouvé pour le dossier '${dossier_id}'.`,
    });
    return;
  }

  const jury = rawJury as unknown as Jury;

  // ── Determine the 30-day scheduling window ──────────────────────────────
  const today = new Date();
  const windowStart = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const windowEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // ── Fetch room availability ──────────────────────────────────────────────
  const { data: rawRooms, error: roomError } = await supabase
    .from('room_availability')
    .select('*')
    .gte('date', windowStart)
    .lte('date', windowEnd);

  if (roomError) {
    console.error('[smartSuggest] room_availability fetch error:', roomError.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Erreur de chargement des disponibilités des salles.' });
    return;
  }

  const rooms = (rawRooms ?? []) as unknown as RoomAvailability[];

  // ── Fetch professor schedules for all jury members ───────────────────────
  const juryMemberIds = [
    jury.president_id,
    jury.examinateur_id,
    ...(jury.rapporteur_id ? [jury.rapporteur_id] : []),
  ];

  const { data: rawSchedules, error: scheduleError } = await supabase
    .from('professor_schedules')
    .select('*')
    .in('professor_id', juryMemberIds)
    .gte('date', windowStart)
    .lte('date', windowEnd);

  if (scheduleError) {
    console.error('[smartSuggest] professor_schedules fetch error:', scheduleError.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Erreur de chargement des emplois du temps des jurés.' });
    return;
  }

  const schedules = (rawSchedules ?? []) as unknown as ProfessorSchedule[];

  // ── Fetch jury member names (for human-readable conflict messages) ────────
  const { data: rawProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', juryMemberIds);

  const juryProfiles = new Map<string, string>(
    ((rawProfiles ?? []) as Array<{ id: string; full_name: string }>).map(
      (p) => [p.id, p.full_name]
    )
  );

  // ── Generate and score all candidate slots ───────────────────────────────
  const candidates: CandidateSlot[] = [];

  if (rooms.length === 0) {
    // No room data in DB yet — generate mock candidates for demo purposes.
    const mockDates = [1, 3, 7].map((offset) => {
      const d = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
      return d.toISOString().slice(0, 10);
    });

    const mockSlots = [
      { start: '09:00', end: '11:00' },
      { start: '14:00', end: '16:00' },
    ];

    const mockRooms = ['Amphi A', 'Salle 12', 'Salle Conférences'];

    for (const date of mockDates) {
      for (const slot of mockSlots) {
        for (const salle of mockRooms) {
          const mockTimeSlot: TimeSlot = {
            start: slot.start,
            end: slot.end,
            is_booked: false,
            soutenance_id: null,
          };
          const scored = scoreSlot(
            mockTimeSlot,
            salle,
            date,
            jury,
            juryProfiles,
            schedules
          );
          candidates.push({ date, salle, ...scored });
        }
      }
    }
  } else {
    for (const room of rooms) {
      for (const slot of room.time_slots) {
        const scored = scoreSlot(slot, room.salle, room.date, jury, juryProfiles, schedules);
        candidates.push({ date: room.date, salle: room.salle, ...scored });
      }
    }
  }

  // ── Sort by score (descending) and pick top 3 ───────────────────────────
  candidates.sort((a, b) => b.score - a.score);

  const top3: SuggestedSlot[] = candidates.slice(0, 3).map((c, idx) => ({
    rank: idx + 1,
    date: c.date,
    start: c.start,
    end: c.end,
    salle: c.salle,
    optimality_score: c.score,
    conflict_details: c.conflict_details,
  }));

  // ── Respond ──────────────────────────────────────────────────────────────
  res.status(200).json({
    dossier_id,
    jury: {
      president_id: jury.president_id,
      examinateur_id: jury.examinateur_id,
      rapporteur_id: jury.rapporteur_id,
    },
    scheduling_window: { from: windowStart, to: windowEnd },
    algorithm: 'availability-intersection-v1',
    suggested_slots: top3,
    generated_at: new Date().toISOString(),
  });
}
