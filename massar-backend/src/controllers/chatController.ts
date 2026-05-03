import type { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import type { AuthenticatedUser } from '../types/database.js';

// ---------------------------------------------------------------------------
// Helper — verify the requesting user is a participant of a supervision request
// ---------------------------------------------------------------------------
async function verifyParticipant(
  supervisionRequestId: string,
  userId: string,
): Promise<{ ok: boolean; supReq?: any }> {
  const { data: supReq, error } = await (supabase as any)
    .from('supervision_requests')
    .select('id, student_id, professor_id, status')
    .eq('id', supervisionRequestId)
    .single();

  if (error || !supReq) return { ok: false };
  if (supReq.student_id !== userId && supReq.professor_id !== userId) return { ok: false };
  return { ok: true, supReq };
}

// ---------------------------------------------------------------------------
// GET /api/chat/:supervision_request_id
// Returns all messages for a supervision conversation
// ---------------------------------------------------------------------------
export async function getMessages(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { supervision_request_id } = req.params;

  try {
    const { ok } = await verifyParticipant(supervision_request_id as any, user.id);
    if (!ok) {
      res.status(403).json({ error: 'Forbidden', message: 'You are not a participant in this conversation.' });
      return;
    }

    const { data, error } = await (supabase as any)
      .from('supervision_messages')
      .select(`
        id,
        content,
        sender_id,
        sender_role,
        created_at,
        sender:profiles!sender_id(full_name, role)
      `)
      .eq('supervision_request_id', supervision_request_id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('[chatController] getMessages error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/chat/:supervision_request_id
// Send a message in a supervision conversation
// ---------------------------------------------------------------------------
export async function sendMessage(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as AuthenticatedUser;
  const { supervision_request_id } = req.params;
  const { content } = req.body as { content?: string };

  if (!content?.trim()) {
    res.status(400).json({ error: 'Bad Request', message: 'content is required.' });
    return;
  }

  try {
    const { ok, supReq } = await verifyParticipant(supervision_request_id as any, user.id);
    if (!ok || !supReq) {
      res.status(403).json({ error: 'Forbidden', message: 'You are not a participant in this conversation.' });
      return;
    }

    const { data, error } = await (supabase as any)
      .from('supervision_messages')
      .insert({
        supervision_request_id,
        sender_id: user.id,
        sender_role: user.role,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        sender_id,
        sender_role,
        created_at,
        sender:profiles!sender_id(full_name, role)
      `)
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('[chatController] sendMessage error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
