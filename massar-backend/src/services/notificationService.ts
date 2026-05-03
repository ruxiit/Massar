import { supabase } from '../config/supabaseClient';
import type { NotificationInsert } from '../types/database';

/**
 * Utility to send a notification to a specific user.
 * 
 * In a real application, this could also trigger an email or push notification.
 * Since we use Supabase, inserting into the 'notifications' table will trigger
 * real-time events for any client listening to that table.
 */
export async function sendNotification(params: NotificationInsert): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from('notifications')
      .insert({
        user_id: params.user_id,
        title: params.title,
        content: params.content,
        type: params.type || 'info',
        link: params.link || null,
        is_read: false,
      });

    if (error) {
      console.error('[NotificationService] Error sending notification:', error.message);
    }
  } catch (error) {
    console.error('[NotificationService] Unexpected error:', error);
  }
}

/**
 * Convenience helper to notify multiple users at once.
 */
export async function notifyUsers(userIds: string[], params: Omit<NotificationInsert, 'user_id'>): Promise<void> {
  const notifications = userIds.map(id => ({
    user_id: id,
    ...params
  }));

  try {
    const { error } = await (supabase as any)
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('[NotificationService] Error notifying multiple users:', error.message);
    }
  } catch (error) {
    console.error('[NotificationService] Unexpected error:', error);
  }
}
