import { apiClient } from '@/services/api/axios';

export const employeeApi = {
  getEmployees: async (params) => {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },
  getEmployeeById: async (id) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },
  createEmployee: async (data) => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },
  deleteEmployee: async (id) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },
};
