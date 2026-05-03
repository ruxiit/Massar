import type { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import type { Dossier, AuthenticatedUser } from '../types/database';
import { sendNotification } from '../services/notificationService';

// ---------------------------------------------------------------------------
// § Internal helpers
// ---------------------------------------------------------------------------

interface PlagiarismFeedbackItem {
  severity: 'high' | 'medium' | 'low';
  area: string;
  suggestion: string;
}

/**
 * Deterministic mock iThenticate similarity score.
 *
 * In production this would be replaced with an actual iThenticate / Turnitin
 * API call.  For the hackathon demo we derive a pseudo-random but reproducible
 * score from the dossier's UUID so the response is stable across calls.
 */
function mockIThenticateScore(dossierId: string): number {
  // XOR the char-codes of the UUID to produce a stable seed.
  const seed = dossierId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc ^ ch.charCodeAt(0), 0);

  // Map the seed to a realistic range [5 – 72].
  return 5 + (seed % 68);
}

/**
 * Generate actionable, tiered feedback based on the similarity score.
 * Thresholds mirror iThenticate's recommended academic cutoffs.
 */
function buildFeedback(
  score: number,
  resume: string
): PlagiarismFeedbackItem[] {
  const items: PlagiarismFeedbackItem[] = [];

  if (score > 40) {
    items.push({
      severity: 'high',
      area: 'Introduction / État de l\'art',
      suggestion:
        'Votre résumé contient des passages qui correspondent presque mot pour mot à des sources publiées. ' +
        'Reformulez entièrement ces sections en utilisant vos propres mots et ajoutez des citations appropriées (APA 7e édition).',
    });
  }

  if (score > 20) {
    items.push({
      severity: 'medium',
      area: 'Bibliographie & citations',
      suggestion:
        'Plusieurs citations directes ne sont pas mises entre guillemets ou ne comportent pas de numéro de page. ' +
        'Consultez le guide de rédaction académique de votre établissement (section 4.2).',
    });
    items.push({
      severity: 'medium',
      area: 'Paraphrase insuffisante',
      suggestion:
        'Certains passages paraphrasés restent trop proches de la source originale. ' +
        'Essayez de restructurer la phrase entière plutôt que de substituer quelques mots.',
    });
  }

  // Low-score advice is always included as a "good practice" nudge.
  items.push({
    severity: 'low',
    area: 'Auto-citation',
    suggestion:
      'Vérifiez que vos propres travaux antérieurs sont correctement cités pour éviter l\'auto-plagiat.',
  });

  // Resume-length heuristic – flag very short abstracts.
  if (resume.split(' ').length < 50) {
    items.push({
      severity: 'low',
      area: 'Résumé trop court',
      suggestion:
        'Un résumé de moins de 50 mots donne peu de contexte aux évaluateurs. ' +
        'Visez 150 – 300 mots décrivant objectif, méthode et résultats.',
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// § Controller
// ---------------------------------------------------------------------------

/**
 * POST /api/dossiers/plagiarism-check
 *
 * Accepts a `dossier_id` in the request body, fetches the corresponding
 * dossier from Supabase, and returns a mock iThenticate similarity report.
 *
 * Business rules:
 *   • score ≤ 20 %  → status updated to 'plagiat_verifie' (green-light)
 *   • score 21–40 % → "Early Warning" – actionable feedback, NOT rejected
 *   • score  > 40 % → "High Risk" – strong feedback + flag for N1 review
 *
 * Role access: directeur | departement
 */
export async function checkPlagiarism(req: Request, res: Response): Promise<void> {
  const { dossier_id } = req.body as { dossier_id?: string };

  // ── Validate input ──────────────────────────────────────────────────────
  if (!dossier_id || typeof dossier_id !== 'string') {
    res.status(400).json({
      error: 'Bad Request',
      message: '`dossier_id` (UUID string) is required in the request body.',
    });
    return;
  }

  // ── Fetch dossier ───────────────────────────────────────────────────────
  const { data: rawData, error: fetchError } = await supabase
    .from('dossiers')
    .select('*')
    .eq('id', dossier_id)
    .single();

  if (fetchError || !rawData) {
    res.status(404).json({
      error: 'Not Found',
      message: `Dossier with id '${dossier_id}' not found.`,
    });
    return;
  }

  const dossier = rawData as unknown as Dossier;

  // ── Generate mock score ─────────────────────────────────────────────────
  const similarityScore = mockIThenticateScore(dossier.id);
  const feedback = buildFeedback(similarityScore, dossier.resume);

  // ── Determine verdict ───────────────────────────────────────────────────
  let verdict: 'approved' | 'early_warning' | 'high_risk';
  let httpStatus = 200;

  if (similarityScore <= 20) {
    verdict = 'approved';
  } else if (similarityScore <= 40) {
    verdict = 'early_warning';
  } else {
    verdict = 'high_risk';
    httpStatus = 200; // We still return 200; we never hard-reject, only advise.
  }

  // ── Persist score & conditionally advance status ────────────────────────
  const updatePayload: { plagiarism_score: number; status?: string } = {
    plagiarism_score: similarityScore,
  };

  if (verdict === 'approved') {
    updatePayload.status = 'plagiat_verifie';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('dossiers')
    .update(updatePayload)
    .eq('id', dossier_id);

  if (updateError) {
    console.error('[checkPlagiarism] update error:', updateError.message);
    // Non-fatal – we still return the report even if the DB write failed.
  }

  // ── Build response ──────────────────────────────────────────────────────
  const responseBody = {
    dossier_id,
    provider: 'iThenticate (Mock)',
    similarity_score: similarityScore,
    verdict,
    status_updated: verdict === 'approved' ? 'plagiat_verifie' : dossier.status,
    report: {
      threshold_green: 20,
      threshold_amber: 40,
      interpretation:
        verdict === 'approved'
          ? 'Score acceptable. Le dossier est validé et passe à l\'étape suivante.'
          : verdict === 'early_warning'
          ? 'Score modéré. Des améliorations sont recommandées avant la soumission définitive.'
          : 'Score élevé. Le dossier nécessite une révision approfondie et une validation manuelle par le département.',
      feedback,
    },
    generated_at: new Date().toISOString(),
  };

  res.status(httpStatus).json(responseBody);

  // Notify student and teacher about the result
  try {
    await sendNotification({
      user_id: dossier.student_id,
      title: 'نتائج فحص السرقة العلمية',
      content: verdict === 'approved' 
        ? 'تم قبول ملفك بنجاح. نسبة التشابه منخفضة.' 
        : `نسبة التشابه في ملفك هي ${similarityScore}%. يرجى مراجعة التقرير.`,
      type: verdict === 'approved' ? 'success' : 'warning',
      link: '/student/dossier'
    });

    if (dossier.director_id) {
      await sendNotification({
        user_id: dossier.director_id,
        title: 'نتائج فحص السرقة العلمية (طالب)',
        content: `تلقى الطالب نتائج فحص السرقة العلمية بنسبة ${similarityScore}%.`,
        type: 'info',
        link: '/teacher/dossiers'
      });
    }
  } catch (err) {
    console.error('Notification error in checkPlagiarism:', err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/dossiers
// ---------------------------------------------------------------------------
export async function getDossiers(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;

  try {
    let query = supabase.from('dossiers').select(`
      *, 
      student:profiles!student_id(full_name, matricule, email),
      director:profiles!director_id(full_name, email),
      soutenances:soutenances(*, deliberations(*)),
      jury:jury(*)
    `);

    if (user.role === 'etudiant') {
      query = query.eq('student_id', user.id);
    }
    // Teachers and admins see all for now in this demo

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const parsedData = data.map((d: any) => {
      let title = 'مذكرة';
      let abstract = d.resume;
      if (d.resume && d.resume.startsWith('[Title: ')) {
        const endIndex = d.resume.indexOf(']\n\n');
        if (endIndex !== -1) {
          title = d.resume.substring(8, endIndex);
          abstract = d.resume.substring(endIndex + 3);
        }
      }
      return { ...d, title, abstract };
    });

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error fetching dossiers:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dossiers
// ---------------------------------------------------------------------------
export async function uploadDossier(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const file = req.file;
  const { title, abstract } = req.body;

  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  if (!title || !abstract) {
    res.status(400).json({ error: 'Title and abstract are required' });
    return;
  }

  try {
    // ── 1. Fetch the student's accepted supervision request ──────────────────
    const { data: supervisionReq, error: supError } = await (supabase as any)
      .from('supervision_requests')
      .select('id, professor_id, theme_id')
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .maybeSingle();

    if (supError) {
      console.error('[uploadDossier] supervision fetch error:', supError.message);
    }

    if (!supervisionReq) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'يجب أن تمتلك طلب إشراف مقبولاً من أستاذ قبل إيداع الملف.',
      });
      return;
    }

    // ── 2. Check student doesn't already have a dossier ────────────────────
    const { data: existingDossier } = await (supabase as any)
      .from('dossiers')
      .select('id, status')
      .eq('student_id', user.id)
      .maybeSingle();

    const isReupload = existingDossier && existingDossier.status === 'rejected';

    if (existingDossier && !isReupload) {
      res.status(409).json({
        error: 'Conflict',
        message: 'لقد قمت بإيداع ملف مذكرة مسبقاً وهو قيد المعالجة.',
      });
      return;
    }

    // ── 3. Upload file to Supabase Storage ──────────────────────────────────
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b: any) => b.name === 'dossiers')) {
      await supabase.storage.createBucket('dossiers', { public: true });
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dossiers')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      res.status(500).json({ error: 'Failed to upload document' });
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('dossiers')
      .getPublicUrl(filePath);

    // ── 4. Insert or Update dossier record ──────────────────────────────────
    const combinedResume = `[Title: ${title}]\n\n${abstract}`;
    const dossierPayload = {
      student_id: user.id,
      document_url: publicUrlData.publicUrl,
      resume: combinedResume,
      status: 'depose',
      director_id: supervisionReq.professor_id,
      theme_id: supervisionReq.theme_id,
      supervision_request_id: supervisionReq.id,
    };

    let result;
    if (isReupload) {
      result = await (supabase as any)
        .from('dossiers')
        .update(dossierPayload)
        .eq('id', existingDossier.id)
        .select()
        .single();
    } else {
      result = await (supabase as any)
        .from('dossiers')
        .insert(dossierPayload)
        .select()
        .single();
    }

    const { data: dossier, error: dbError } = result;

    if (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to save dossier record' });
      return;
    }

    // Notify the teacher
    await sendNotification({
      user_id: supervisionReq.professor_id,
      title: 'إيداع مذكرة جديد',
      content: `قام الطالب ${user.full_name} بإيداع النسخة النهائية من مذكرته.`,
      type: 'info',
      link: '/teacher/dossiers'
    });

    res.status(201).json(dossier);
  } catch (error: any) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


// ---------------------------------------------------------------------------
// PATCH /api/dossiers/:id/status
// ---------------------------------------------------------------------------
export async function updateDossierStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, date, time, room, jury, note, mention, observations } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  try {
    console.log(`[updateDossierStatus] Request for dossier ${id}, status: ${status}`);
    
    // Handle rejection by deleting the dossier (since the DB enum doesn't support 'rejected')
    if (status === 'rejected') {
      const { data: dossierToDelete, error: fetchError } = await supabase
        .from('dossiers')
        .select('student_id, title')
        .eq('id', id as any)
        .single();

      if (dossierToDelete) {
        await sendNotification({
          user_id: (dossierToDelete as any).student_id,
          title: 'تم رفض المذكرة',
          content: 'لقد رفض المشرف مذكرتك. يرجى مراجعة الملاحظات وإعادة الإيداع.',
          type: 'error',
          link: '/student'
        });
      }

      const { error: deleteError } = await supabase
        .from('dossiers')
        .delete()
        .eq('id', (id as any));

      if (deleteError) throw deleteError;
      
      res.json({ message: 'Dossier rejected and deleted successfully' });
      return;
    }

    // 1. Update dossier status
    const { data: dossier, error: updateError } = await (supabase as any)
      .from('dossiers')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('[updateDossierStatus] main update error:', updateError);
      throw updateError;
    }

    if (!dossier) {
      console.error('[updateDossierStatus] Dossier not found:', id);
      res.status(404).json({ error: 'Not Found', message: `Dossier with id '${id}' not found.` });
      return;
    }

    // 2. Handle Scheduling (Soutenance)
    const dateVal = date || req.body.date_soutenance;
    const roomVal = room || req.body.salle;

    if ((status === 'planifie' || status === 'defense_scheduled') && dateVal && roomVal) {
      console.log(`[updateDossierStatus] Scheduling logic triggered: date=${dateVal}, room=${roomVal}`);
      
      const { data: existingSoutenance, error: fetchSoutenanceError } = await supabase
        .from('soutenances')
        .select('id')
        .eq('dossier_id', id as any)
        .maybeSingle();

      if (fetchSoutenanceError) {
        console.error('[updateDossierStatus] fetchSoutenanceError:', fetchSoutenanceError.message);
      }

      let dateObj: Date;
      try {
        dateObj = new Date(`${dateVal} ${time || '10:00'}`);
        if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
      } catch (e) {
        console.error('[updateDossierStatus] Invalid date:', dateVal, time);
        res.status(400).json({ error: 'Bad Request', message: 'Date or time format is invalid.' });
        return;
      }

      const soutenanceData = {
        dossier_id: id,
        salle: roomVal,
        date_soutenance: dateObj.toISOString()
      };

      if (existingSoutenance) {
        const { error: updateSoutError } = await (supabase as any)
          .from('soutenances')
          .update(soutenanceData)
          .eq('id', (existingSoutenance as any).id as any);
        if (updateSoutError) {
          console.error('[updateDossierStatus] updateSoutError:', updateSoutError);
          throw updateSoutError;
        }
      } else {
        const { error: insertSoutError } = await (supabase as any)
          .from('soutenances')
          .insert(soutenanceData);
        if (insertSoutError) {
          console.error('[updateDossierStatus] insertSoutError:', insertSoutError);
          throw insertSoutError;
        }
      }
    }

    // 3. Handle Jury
    if (jury && (jury.president_id || jury.examinateur_id)) {
      console.log(`[updateDossierStatus] Updating jury for dossier ${id}`);
      
      const { data: existingJury, error: fetchJuryError } = await (supabase as any)
        .from('jury')
        .select('id')
        .eq('dossier_id', id as any)
        .maybeSingle();

      if (fetchJuryError) {
        console.error('[updateDossierStatus] fetchJuryError:', fetchJuryError.message);
      }

      const juryData = {
        dossier_id: id,
        president_id: jury.president_id || null,
        examinateur_id: jury.examinateur_id || null,
        rapporteur_id: (jury.rapporteur_id || dossier.director_id) || null
      };

      // Basic validation for mandatory jury members when scheduling
      if (status === 'planifie' && (!juryData.president_id || !juryData.examinateur_id)) {
         res.status(400).json({ error: 'Bad Request', message: 'President and Examiner are required for scheduling.' });
         return;
      }

      if (existingJury) {
        const { error: updateJuryError } = await (supabase as any)
          .from('jury')
          .update(juryData)
          .eq('id', existingJury.id);
        if (updateJuryError) {
          console.error('[updateDossierStatus] updateJuryError:', updateJuryError);
          throw updateJuryError;
        }
      } else {
        const { error: insertJuryError } = await (supabase as any)
          .from('jury')
          .insert(juryData);
        if (insertJuryError) {
          console.error('[updateDossierStatus] insertJuryError:', insertJuryError);
          throw insertJuryError;
        }
      }
    }

    // 4. Handle Deliberation (status: delibere)
    if (status === 'delibere') {
      console.log(`[updateDossierStatus] Recording deliberation for dossier ${id}`);
      
      const { data: soutenance, error: soutError } = await supabase
        .from('soutenances')
        .select('id')
        .eq('dossier_id', id as any)
        .maybeSingle();

      if (soutError || !soutenance) {
        console.error('[updateDossierStatus] Soutenance not found for deliberation');
      } else {
        // Handle PV File upload if present
        const file = req.file;
        let pvUrl = null;

        if (file) {
          try {
            const fileExt = file.originalname.split('.').pop();
            const fileName = `pv-${id}-${Date.now()}.${fileExt}`;
            const filePath = `pvs/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('dossiers')
              .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('dossiers')
                .getPublicUrl(filePath);
              pvUrl = publicUrlData.publicUrl;
              
              // Update soutenance with pv_url
              await (supabase as any)
                .from('soutenances')
                .update({ pv_url: pvUrl })
                .eq('id', (soutenance as any).id);
            }
          } catch (storageError) {
            console.error('[updateDossierStatus] PV Storage Error:', storageError);
          }
        }

        // Insert deliberation record (wrapped in try-catch because table might be missing)
        if (note !== undefined) {
          try {
            console.log(`[updateDossierStatus] Attempting deliberation insert: note=${note}, mention=${mention}`);
            const numericNote = parseFloat(note as string);
            
            if (!isNaN(numericNote)) {
              const { error: delibInsertError } = await (supabase as any)
                .from('deliberations')
                .insert({
                  soutenance_id: (soutenance as any).id,
                  note: numericNote,
                  mention: mention || null,
                  observations: observations || null
                });
              
              if (delibInsertError) {
                console.error('[updateDossierStatus] deliberation insert error (DB):', delibInsertError.message);
              }
            } else {
              console.warn('[updateDossierStatus] Invalid note value (NaN):', note);
            }
          } catch (delibError: any) {
            console.error('[updateDossierStatus] deliberation table error (catch):', delibError.message);
          }
        }
      }
    }

    // Notify Student about status update
    try {
      let notifyTitle = 'تحديث حالة الملف';
      let notifyContent = `تم تحديث حالة ملفك إلى: ${status}`;
      
      if (status === 'planifie') {
        notifyTitle = 'برمجة المناقشة';
        notifyContent = `تمت برمجة مناقشتك بتاريخ ${dateVal} في القاعة ${roomVal}.`;
      } else if (status === 'delibere') {
        notifyTitle = 'نتائج المناقشة';
        notifyContent = `تم تسجيل نتائج مناقشتك بنجاح. العلامة: ${note}.`;
      }

      await sendNotification({
        user_id: dossier.student_id,
        title: notifyTitle,
        content: notifyContent,
        type: 'success',
        link: '/student/workflow'
      });

      // Also notify teacher if status is scheduled or deliberated
      if ((status === 'planifie' || status === 'delibere') && dossier.director_id) {
        await sendNotification({
          user_id: dossier.director_id,
          title: notifyTitle,
          content: `(طالب) ${notifyContent}`,
          type: 'info',
          link: '/teacher/dossiers'
        });
      }
    } catch (err) {
      console.error('Notification error in updateDossierStatus:', err);
    }

    res.json(dossier);
  } catch (error: any) {
    console.error('[updateDossierStatus] Unexpected error:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message || 'Unknown error' });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/dossiers/:id (Withdrawal)
// ---------------------------------------------------------------------------
export async function withdrawDossier(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const user = (req as any).user as AuthenticatedUser;

  try {
    // 1. Fetch dossier to check ownership and status
    const { data: dossier, error: fetchError } = await supabase
      .from('dossiers')
      .select('student_id, status, director_id')
      .eq('id', id as any)
      .single();

    if (fetchError || !dossier) {
      res.status(404).json({ error: 'Not Found', message: 'الملف غير موجود.' });
      return;
    }

    // 2. Check ownership
    if ((dossier as any).student_id !== user.id) {
      res.status(403).json({ error: 'Forbidden', message: 'ليس لديك الصلاحية لسحب هذا الملف.' });
      return;
    }

    // 3. Check status (only allow withdrawal if status is 'depose')
    if ((dossier as any).status !== 'depose') {
      res.status(400).json({ 
        error: 'Bad Request', 
        message: 'لا يمكن سحب المذكرة بعد بدء عملية المراجعة.' 
      });
      return;
    }

    // 4. Delete dossier
    const { error: deleteError } = await supabase
      .from('dossiers')
      .delete()
      .eq('id', id as any);

    if (deleteError) throw deleteError;

    // 5. Notify the teacher about withdrawal
    if ((dossier as any).director_id) {
      await sendNotification({
        user_id: (dossier as any).director_id,
        title: 'سحب مذكرة',
        content: `قام الطالب ${user.full_name} بسحب مذكرته المودعة مؤخراً.`,
        type: 'warning',
        link: '/teacher/dossiers'
      });
    }

    res.json({ message: 'تم سحب المذكرة بنجاح.' });
  } catch (error: any) {
    console.error('[withdrawDossier] error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
