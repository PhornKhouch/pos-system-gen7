import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { apiClient } from '@/services/api/axios';
import { useAppStore } from '@/store/store';

/**
 * API call to perform user login using email and password
 * Reference: node-api/api_tests/user_api_test.md (#6 Login User: POST /api/v1/user/login)
 *
 * @param {{ email: string, password: string }} credentials - Login payload with email only
 * @returns {Promise<{ success: boolean, message: string, token: string, user: Object }>}
 */
export const loginRequest = async ({ email, password }) => {
  const payload = {
    email: email?.trim(),
    password: password,
  };

  const response = await apiClient.post('/user/login', payload);
  return response;
};

/**
 * Mutation hook for user authentication via React Query
 * Handles token/user storage and user-friendly notifications
 *
 * @param {Object} [options] - Additional React Query mutation options
 */
export const useLogin = (options = {}) => {
  const setAuth = useAppStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data, variables, context) => {
      const rawUser = data.user || {};
      const normalizedUser = {
        ...rawUser,
        name: rawUser.full_name || rawUser.username || rawUser.name || rawUser.email,
      };

      setAuth(normalizedUser, data.token);
      message.success(data.message || `Welcome back, ${normalizedUser.name}!`);

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      const errorMsg = error?.message || 'Invalid email or password';
      message.error(errorMsg);

      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export default { loginRequest, useLogin };
