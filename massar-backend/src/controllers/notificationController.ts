import type { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import type { AuthenticatedUser } from '../types/database';

/**
 * GET /api/notifications
 * Fetches notifications for the current authenticated user.
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;

  try {
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('[NotificationController] Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read.
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;

  try {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    console.error('[NotificationController] Error marking notification as read:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications for the current user as read.
 */
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;

  try {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    console.error('[NotificationController] Error marking all notifications as read:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
