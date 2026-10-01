import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from '@/lib/toast';

/**
 * API call to perform login
 */
export const loginRequest = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

/**
 * Mutation hook for user authentication
 */
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`, 'Signed In');
    },
    onError: (error) => {
      toast.error(error.message || 'Invalid email or password', 'Login Failed');
    },
  });
};
