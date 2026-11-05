import { apiClient } from '@/services/api/axios';

/**
 * Authentication API Service
 * Reference: node-api/api_tests/user_api_test.md (#6 Login User: POST /api/v1/user/login)
 */
export const authApi = {
  /**
   * Authenticate user with email and password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, message: string, token: string, user: Object }>}
   */
  login: async ({ email, password }) => {
    const payload = {
      email: email?.trim(),
      password: password,
    };
    const response = await apiClient.post('/user/login', payload);
    return response;
  },


  /**
   * Logout user (client-side or token invalidation)
   */
  logout: async () => {
    return true;
  },
};

export default authApi;
