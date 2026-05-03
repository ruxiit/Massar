import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    let token = null;

    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      
      // Determine which token to use based on the current portal path
      if (path.startsWith('/student')) {
        token = localStorage.getItem('token_etudiant');
      } else if (path.startsWith('/teacher')) {
        token = localStorage.getItem('token_directeur');
      } else if (path.startsWith('/admin')) {
        // Admin could be departement or faculte, we try both or check a common key
        token = localStorage.getItem('token_departement') || localStorage.getItem('token_faculte');
      }
      
      // Fallback to generic token if portal-specific one isn't found
      if (!token) token = localStorage.getItem('token');
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser/Axios set Content-Type automatically.
    // For FormData (file uploads), the browser must set multipart/form-data
    // with the correct boundary — overriding it with application/json breaks Multer.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;