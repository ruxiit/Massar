import apiClient from '@/lib/apiClient';

export const supervisionService = {
  /** Student: get their own requests, Professor: get incoming requests */
  getMyRequests: async () => {
    const response = await apiClient.get('/supervision/my-requests');
    return response.data;
  },

  /** Student: get their single accepted request (null if none) */
  getMyAcceptedRequest: async () => {
    const response = await apiClient.get('/supervision/my-accepted');
    return response.data;
  },

  /** Student sends a supervision request for a theme */
  requestSupervision: async (theme_id: string, student_message?: string) => {
    const response = await apiClient.post('/supervision/request', {
      theme_id,
      student_message: student_message || null,
    });
    return response.data;
  },

  /** Professor accepts or rejects a student's request */
  reviewRequest: async (
    id: string,
    action: 'accept' | 'reject',
    professor_feedback?: string
  ) => {
    const response = await apiClient.patch(`/supervision/requests/${id}/review`, {
      action,
      professor_feedback,
    });
    return response.data;
  },
};
