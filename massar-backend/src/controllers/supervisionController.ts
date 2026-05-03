import type { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import type { AuthenticatedUser } from '../types/database.js';
import { sendNotification } from '../services/notificationService';

// ---------------------------------------------------------------------------
// POST /api/supervision/request
// Student sends a supervision request for an approved theme
// ---------------------------------------------------------------------------
export async function requestSupervision(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { theme_id, student_message } = req.body;

  if (!theme_id) {
    res.status(400).json({ error: 'Bad Request', message: 'theme_id is required.' });
    return;
  }

  try {
    // 1. Check theme exists and is approved
    const { data: theme, error: themeError } = await (supabase as any)
      .from('themes')
      .select('id, professor_id, status, max_students')
      .eq('id', theme_id)
      .single();

    if (themeError || !theme) {
      res.status(404).json({ error: 'Not Found', message: 'Theme not found.' });
      return;
    }

    if (theme.status !== 'approved') {
      res.status(400).json({ error: 'Bad Request', message: 'Theme is not approved yet.' });
      return;
    }

    // 2. Check student does not already have an accepted request
    const { data: existingAccepted } = await (supabase as any)
      .from('supervision_requests')
      .select('id')
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .limit(1);

    if (existingAccepted && existingAccepted.length > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: 'You already have an accepted supervision request.',
      });
      return;
    }

    // 3. Check theme hasn't reached max students
    const { data: acceptedForTheme } = await (supabase as any)
      .from('supervision_requests')
      .select('id')
      .eq('theme_id', theme_id)
      .eq('status', 'accepted');

    if (acceptedForTheme && acceptedForTheme.length >= (theme.max_students || 1)) {
      res.status(409).json({
        error: 'Conflict',
        message: 'This theme has reached its maximum number of students.',
      });
      return;
    }

    // 4. Check student hasn't already sent a pending request for this theme
    const { data: existingPending } = await (supabase as any)
      .from('supervision_requests')
      .select('id')
      .eq('student_id', user.id)
      .eq('theme_id', theme_id)
      .in('status', ['pending', 'accepted'])
      .limit(1);

    if (existingPending && existingPending.length > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: 'You already have a pending or accepted request for this theme.',
      });
      return;
    }

    // 5. Create the supervision request
    const { data, error } = await (supabase as any)
      .from('supervision_requests')
      .insert({
        student_id: user.id,
        theme_id,
        professor_id: theme.professor_id,
        status: 'pending',
        student_message: student_message || null,
      })
      .select(`
        *,
        theme:themes(title, description, speciality),
        professor:profiles!professor_id(full_name, email),
        student:profiles!student_id(full_name, matricule)
      `)
      .single();

    if (error) throw error;

    // Notify the professor
    await sendNotification({
      user_id: theme.professor_id,
      title: 'طلب إشراف جديد',
      content: `أرسل الطالب ${user.full_name} طلب إشراف للموضوع: ${data.theme.title}`,
      type: 'info',
      link: '/teacher/supervision'
    });

    res.status(201).json(data);
  } catch (error: any) {
    console.error('[supervisionController] requestSupervision error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/supervision/my-requests
// - Student: sees their own requests with status
// - Professor: sees incoming requests for their themes
// ---------------------------------------------------------------------------
export async function getMyRequests(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;

  try {
    let query = (supabase as any)
      .from('supervision_requests')
      .select(`
        *,
        theme:themes(id, title, description, speciality),
        professor:profiles!professor_id(id, full_name, email),
        student:profiles!student_id(id, full_name, matricule, email)
      `)
      .order('created_at', { ascending: false });

    if (user.role === 'etudiant') {
      query = query.eq('student_id', user.id);
    } else if (user.role === 'directeur') {
      query = query.eq('professor_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('[supervisionController] getMyRequests error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/supervision/my-accepted
// Student: get their single accepted supervision request (used by dossier flow)
// ---------------------------------------------------------------------------
export async function getMyAcceptedRequest(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;

  try {
    const { data, error } = await (supabase as any)
      .from('supervision_requests')
      .select(`
        *,
        theme:themes(id, title, description, speciality),
        professor:profiles!professor_id(id, full_name, email)
      `)
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (error: any) {
    console.error('[supervisionController] getMyAcceptedRequest error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/supervision/requests/:id/review
// Professor accepts or rejects a student's supervision request
// On accept: all other pending requests from that student are auto-rejected
// ---------------------------------------------------------------------------
export async function reviewRequest(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;
  const { action, professor_feedback } = req.body as {
    action: 'accept' | 'reject';
    professor_feedback?: string;
  };

  if (!action || !['accept', 'reject'].includes(action)) {
    res.status(400).json({ error: 'Bad Request', message: 'action must be "accept" or "reject".' });
    return;
  }

  try {
    // 1. Fetch the request
    const { data: request, error: fetchError } = await (supabase as any)
      .from('supervision_requests')
      .select('*, theme:themes(professor_id, max_students)')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      res.status(404).json({ error: 'Not Found', message: 'Request not found.' });
      return;
    }

    // 2. Verify professor ownership
    if (request.professor_id !== user.id) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only review requests for your themes.' });
      return;
    }

    if (request.status !== 'pending') {
      res.status(409).json({ error: 'Conflict', message: 'This request has already been reviewed.' });
      return;
    }

    // 3. Update the request
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: updated, error: updateError } = await (supabase as any)
      .from('supervision_requests')
      .update({
        status: newStatus,
        professor_feedback: professor_feedback || null,
      })
      .eq('id', id)
      .select(`
        *,
        theme:themes(id, title, description, speciality),
        professor:profiles!professor_id(full_name, email),
        student:profiles!student_id(full_name, matricule)
      `)
      .single();

    if (updateError) throw updateError;

    // Notify the student
    await sendNotification({
      user_id: request.student_id,
      title: action === 'accept' ? 'تم قبول طلب الإشراف' : 'تم رفض طلب الإشراف',
      content: action === 'accept'
        ? `وافق الأستاذ ${user.full_name} على طلب إشرافك للموضوع: ${updated.theme.title}`
        : `رفض الأستاذ ${user.full_name} طلب إشرافك للموضوع: ${updated.theme.title}. السبب: ${professor_feedback}`,
      type: action === 'accept' ? 'success' : 'error',
      link: '/student/supervision'
    });

    // 4. If accepted: auto-reject all other pending requests from the same student
    if (action === 'accept') {
      await (supabase as any)
        .from('supervision_requests')
        .update({
          status: 'rejected',
          professor_feedback: 'تم قبولك لدى أستاذ آخر.',
        })
        .eq('student_id', request.student_id)
        .eq('status', 'pending')
        .neq('id', id);
    }

    res.json(updated);
  } catch (error: any) {
    console.error('[supervisionController] reviewRequest error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
