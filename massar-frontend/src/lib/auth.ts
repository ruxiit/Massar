/**
 * Decode the current user's JWT stored in localStorage.
 * Returns null if no token or if decoding fails.
 */
export function getCurrentUser(): { id: string; role: string; email: string } | null {
  if (typeof window === 'undefined') return null;

  const path = window.location.pathname;
  let token = null;

  // Pick the right token based on the current portal
  if (path.startsWith('/student')) {
    token = localStorage.getItem('token_etudiant');
  } else if (path.startsWith('/teacher')) {
    token = localStorage.getItem('token_directeur');
  } else if (path.startsWith('/admin')) {
    token = localStorage.getItem('token_departement') || localStorage.getItem('token_faculte');
  }

  // Fallback
  if (!token) token = localStorage.getItem('token');
  
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub ?? payload.id ?? '',
      role: payload.role ?? payload.user_metadata?.role ?? '',
      email: payload.email ?? '',
    };
  } catch {
    return null;
  }
}
