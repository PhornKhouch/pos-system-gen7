import { apiClient } from '@/services/api/axios';

/**
 * User API Service
 * Reference: node-api/api_tests/user_api_test.md
 */
export const userApi = {
  /**
   * Get all users with optional filters (search, role, active, store_id)
   * @param {Object} params - { search?: string, role?: string, active?: number | string, store_id?: number }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getUsers: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.role && params.role !== 'all' && params.role !== 'All') {
      queryParams.role = params.role;
    }
    if (params.active !== undefined && params.active !== 'all' && params.active !== '') {
      queryParams.active = params.active;
    }
    if (params.store_id !== undefined && params.store_id !== 'all' && params.store_id !== '') {
      queryParams.store_id = params.store_id;
    }
    const response = await apiClient.get('/user/getall', { params: queryParams });
    return response;
  },

  /**
   * Get a single user by ID
   * @param {number|string} id - User ID
   * @returns {Promise<{ success: boolean, data: Object }>}
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/user/getone/${id}`);
    return response;
  },

  /**
   * Create a new user with optional profile image upload
   * @param {Object|FormData} userData - { username, password, email, full_name, imageFile?, image?, role, store_id, active }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  createUser: async (userData) => {
    let payload;
    let headers = {};

    if (userData instanceof FormData) {
      payload = userData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else if (userData.imageFile || userData.image instanceof File) {
      const formData = new FormData();
      formData.append('username', userData.username?.trim());
      formData.append('password', userData.password?.trim());
      formData.append('email', userData.email?.trim());
      if (userData.full_name) formData.append('full_name', userData.full_name.trim());
      formData.append('role', userData.role || 'staff');
      if (userData.store_id) formData.append('store_id', Number(userData.store_id));
      formData.append('active', userData.active !== undefined ? (userData.active ? 1 : 0) : 1);

      const file = userData.imageFile || userData.image;
      formData.append('image', file);
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      payload = {
        username: userData.username?.trim(),
        password: userData.password?.trim(),
        email: userData.email?.trim(),
        full_name: userData.full_name ? userData.full_name.trim() : null,
        image: userData.image || null,
        role: userData.role || 'staff',
        store_id: userData.store_id ? Number(userData.store_id) : null,
        active: userData.active !== undefined ? (userData.active ? 1 : 0) : 1,
      };
    }

    const response = await apiClient.post('/user/create', payload, { headers });
    return response;
  },

  /**
   * Update an existing user with optional profile image upload
   * @param {number|string} id - User ID
   * @param {Object|FormData} userData - { username, password?, email, full_name, imageFile?, image?, role, store_id, active }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  updateUser: async (id, userData) => {
    let payload;
    let headers = {};

    if (userData instanceof FormData) {
      payload = userData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else if (userData.imageFile || userData.image instanceof File) {
      const formData = new FormData();
      if (userData.username) formData.append('username', userData.username.trim());
      if (userData.password && userData.password.trim() !== '') {
        formData.append('password', userData.password.trim());
      }
      if (userData.email) formData.append('email', userData.email.trim());
      if (userData.full_name !== undefined) {
        formData.append('full_name', userData.full_name ? userData.full_name.trim() : '');
      }
      if (userData.role) formData.append('role', userData.role);
      if (userData.store_id !== undefined) {
        formData.append('store_id', userData.store_id ? Number(userData.store_id) : '');
      }
      if (userData.active !== undefined) {
        formData.append('active', userData.active ? 1 : 0);
      }

      const file = userData.imageFile || userData.image;
      formData.append('image', file);
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      payload = {
        username: userData.username?.trim(),
        email: userData.email?.trim(),
        full_name: userData.full_name !== undefined ? (userData.full_name ? userData.full_name.trim() : null) : undefined,
        image: userData.image,
        role: userData.role,
        store_id: userData.store_id ? Number(userData.store_id) : null,
        active: userData.active !== undefined ? (userData.active ? 1 : 0) : undefined,
      };
      if (userData.password && userData.password.trim() !== '') {
        payload.password = userData.password.trim();
      }
    }

    const response = await apiClient.put(`/user/update/${id}`, payload, { headers });
    return response;
  },

  /**
   * Delete a user by ID
   * @param {number|string} id - User ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/user/delete/${id}`);
    return response;
  },
};

export default userApi;
