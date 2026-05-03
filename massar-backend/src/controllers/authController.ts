import type { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import type { Profile } from '../types/database.js';

export const authController = {
  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Bad Request', message: 'Email and password are required.' });
      return;
    }

    try {
      // 1. Create a temporary client for this login attempt to avoid polluting the global singleton
      // We use the global config values but a fresh instance.
      const { createClient } = await import('@supabase/supabase-js');
      const authClient = createClient(
        process.env['SUPABASE_URL'] ?? '',
        process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
        { auth: { persistSession: false } }
      );

      // 2. Authenticate with Supabase
      const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user || !authData.session) {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials.' });
        return;
      }

      console.log(`[authController] User authenticated: ${authData.user.id}`);

      // 3. Fetch the user's profile using the GLOBAL service-role client (which is now clean)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        console.error(`[authController] Profile fetch failed for ${authData.user.id}:`, profileError?.message);
        res.status(403).json({
          error: 'Forbidden',
          message: 'User profile not found. Please contact administration.',
        });
        return;
      }

      const profile = profileData as unknown as Profile;

      // 4. Return the token and the user's role
      res.json({
        token: authData.session.access_token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile.role,
          full_name: profile.full_name,
        },
      });
    } catch (error) {
      console.error('[authController] login error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred.' });
    }
  },

  /**
   * Get all profiles with teaching/admin roles (directeur, departement)
   * GET /api/auth/professors
   */
  async getProfessors(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['directeur', 'departement'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('[authController] getProfessors error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
