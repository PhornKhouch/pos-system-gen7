import { apiClient } from '@/services/api/axios';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    // optional server-side session invalidation
    return true;
  },
};
