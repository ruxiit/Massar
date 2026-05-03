import apiClient from '@/lib/apiClient';
import { Dossier } from '@/types/database.types';

export const dossierService = {
  getDossiers: async (role?: string): Promise<Dossier[]> => {
    const params = role ? { role } : {};
    const response = await apiClient.get('/dossiers', { params });
    return response.data;
  },

  getDossierById: async (id: string): Promise<Dossier> => {
    const response = await apiClient.get(`/dossiers/${id}`);
    return response.data;
  },

  submitDossier: async (data: FormData) => {
    const response = await apiClient.post('/dossiers', data);
    return response.data;
  },

  updateDossierStatus: async (id: string, status: string, payload?: any) => {
    if (payload instanceof FormData) {
      // If it's FormData, we assume status is already appended or we append it now
      if (!payload.has('status')) payload.append('status', status);
      const response = await apiClient.patch(`/dossiers/${id}/status`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
    const response = await apiClient.patch(`/dossiers/${id}/status`, { status, ...payload });
    return response.data;
  },
  
  getProfessors: async () => {
    const response = await apiClient.get('/auth/professors');
    return response.data;
  },

  scheduleSoutenance: async (id: string, data: any) => {
    const response = await apiClient.patch(`/dossiers/${id}/status`, { 
      status: 'planifie',
      ...data 
    });
    return response.data;
  },

  withdrawDossier: async (id: string) => {
    const response = await apiClient.delete(`/dossiers/${id}`);
    return response.data;
  }
};