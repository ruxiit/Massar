import apiClient from '@/lib/apiClient';

export const themeService = {
  /** Get themes (filtered by role in backend) */
  getThemes: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/themes', { params });
    return response.data;
  },

  /** Professor creates a new theme */
  createTheme: async (data: {
    title: string;
    description: string;
    speciality?: string;
    max_students?: number;
  }) => {
    const response = await apiClient.post('/themes', data);
    return response.data;
  },

  /** Admin approves or rejects a theme */
  reviewTheme: async (
    id: string,
    action: 'approve' | 'reject',
    admin_feedback?: string
  ) => {
    const response = await apiClient.patch(`/themes/${id}/review`, {
      action,
      admin_feedback,
    });
    return response.data;
  },

  /** Professor deletes their own theme */
  deleteTheme: async (id: string) => {
    const response = await apiClient.delete(`/themes/${id}`);
    return response.data;
  },
};
