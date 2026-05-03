import type { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import type { AuthenticatedUser, ThemeStatus } from '../types/database.js';
import { sendNotification, notifyUsers } from '../services/notificationService';

// ---------------------------------------------------------------------------
// POST /api/themes
// Professor creates a new theme (status = pending_admin)
// ---------------------------------------------------------------------------
export async function createTheme(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { title, description, speciality, max_students } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Bad Request', message: 'Title and description are required.' });
    return;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('themes')
      .insert({
        professor_id: user.id,
        title,
        description,
        speciality: speciality || null,
        max_students: max_students || 1,
        status: 'pending_admin',
      })
      .select(`*, professor:profiles!professor_id(full_name, email)`)
      .single();

    if (error) throw error;

    // Notify admins (departement role)
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'departement');
    if (admins && admins.length > 0) {
      await notifyUsers(admins.map(a => a.id), {
        title: 'موضوع جديد قيد الانتظار',
        content: `قام الأستاذ ${user.full_name} بإضافة موضوع جديد: ${title}`,
        type: 'info',
        link: '/admin/themes'
      });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('[themeController] createTheme error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/themes
// - Professor: sees only their own themes
// - Admin (departement): sees all themes (filter by ?status=)
// - Student (etudiant): sees only approved themes (with professor info)
// ---------------------------------------------------------------------------
export async function getThemes(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { status } = req.query;

  try {
    let query = (supabase as any)
      .from('themes')
      .select(`
        *,
        professor:profiles!professor_id(id, full_name, email, speciality),
        supervision_requests(
          id, 
          student_id, 
          status,
          student:profiles!student_id(id, full_name, email)
        )
      `)
      .order('created_at', { ascending: false });

    if (user.role === 'directeur') {
      // Professor sees only their own themes
      query = query.eq('professor_id', user.id);
    } else if (user.role === 'etudiant') {
      // Students see only approved themes
      query = query.eq('status', 'approved');
    } else if (user.role === 'departement') {
      // Admin can filter by status
      if (status) {
        query = query.eq('status', status as ThemeStatus);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    // For students, add accepted_count to know which themes are full
    const enriched = (data || []).map((theme: any) => ({
      ...theme,
      accepted_count: (theme.supervision_requests || []).filter(
        (r: any) => r.status === 'accepted'
      ).length,
      is_full: (theme.supervision_requests || []).filter(
        (r: any) => r.status === 'accepted'
      ).length >= (theme.max_students || 1),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error('[themeController] getThemes error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/themes/:id/review
// Admin approves or rejects a theme
// ---------------------------------------------------------------------------
export async function reviewTheme(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { action, admin_feedback } = req.body as {
    action: 'approve' | 'reject';
    admin_feedback?: string;
  };

  if (!action || !['approve', 'reject'].includes(action)) {
    res.status(400).json({ error: 'Bad Request', message: 'action must be "approve" or "reject".' });
    return;
  }

  if (action === 'reject' && !admin_feedback) {
    res.status(400).json({ error: 'Bad Request', message: 'admin_feedback is required when rejecting.' });
    return;
  }

  try {
    const newStatus: ThemeStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data, error } = await (supabase as any)
      .from('themes')
      .update({
        status: newStatus,
        admin_feedback: admin_feedback || null,
      })
      .eq('id', id)
      .select(`*, professor:profiles!professor_id(full_name, email)`)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Not Found', message: `Theme '${id}' not found.` });
      return;
    }

    // Notify the professor
    await sendNotification({
      user_id: data.professor_id,
      title: action === 'approve' ? 'تم قبول موضوعك' : 'تم رفض موضوعك',
      content: action === 'approve' 
        ? `تمت الموافقة على موضوعك: ${data.title}` 
        : `تم رفض موضوعك: ${data.title}. السبب: ${admin_feedback}`,
      type: action === 'approve' ? 'success' : 'error',
      link: '/teacher/themes'
    });

    res.json(data);
  } catch (error: any) {
    console.error('[themeController] reviewTheme error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/themes/:id
// Professor deletes their own theme (only if no accepted supervision request)
// ---------------------------------------------------------------------------
export async function deleteTheme(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;

  try {
    // Check ownership
    const { data: theme, error: fetchError } = await (supabase as any)
      .from('themes')
      .select('id, professor_id')
      .eq('id', id)
      .single();

    if (fetchError || !theme) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    if (theme.professor_id !== user.id) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only delete your own themes.' });
      return;
    }

    // Check for accepted supervision requests
    const { data: accepted } = await (supabase as any)
      .from('supervision_requests')
      .select('id')
      .eq('theme_id', id)
      .eq('status', 'accepted')
      .limit(1);

    if (accepted && accepted.length > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Cannot delete a theme that has an accepted supervision request.',
      });
      return;
    }

    const { error: deleteError } = await (supabase as any)
      .from('themes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    res.status(204).send();
  } catch (error: any) {
    console.error('[themeController] deleteTheme error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
