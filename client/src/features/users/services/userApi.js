import { apiClient } from '@/services/api/axios';

export const userApi = {
  getUsers: async (params) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
