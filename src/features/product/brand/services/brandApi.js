import { apiClient } from '@/services/api/axios';

/**
 * Brand API Service
 * Reference: node-api/api_tests/brand_api_test.md
 */
export const brandApi = {
  /**
   * Get all brands with optional search and active status filter
   * @param {Object} params - { search?: string, active?: number | string }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getBrands: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.active !== undefined && params.active !== 'all' && params.active !== '') {
      queryParams.active = params.active;
    }
    const response = await apiClient.get('/brand/getall', { params: queryParams });
    return response;
  },

  /**
   * Create a new brand with optional image upload
   * @param {Object|FormData} data - { brand_name: string, description?: string, image?: File|string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  createBrand: async (data) => {
    let payload;
    let headers = {};

    if (data instanceof FormData) {
      payload = data;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else if (data.imageFile || data.image instanceof File) {
      const formData = new FormData();
      formData.append('brand_name', data.brand_name.trim());
      if (data.description) formData.append('description', data.description.trim());
      formData.append('active', data.active ? 1 : 0);
      const file = data.imageFile || data.image;
      formData.append('image', file);
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      payload = {
        brand_name: data.brand_name.trim(),
        description: data.description ? data.description.trim() : null,
        image: data.image || null,
        active: data.active ? 1 : 0,
      };
    }

    const response = await apiClient.post('/brand/create', payload, { headers });
    return response;
  },

  /**
   * Update brand by ID with optional image upload
   * @param {number|string} id - Brand ID
   * @param {Object|FormData} data - { brand_name: string, description?: string, image?: File|string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  updateBrand: async (id, data) => {
    let payload;
    let headers = {};

    if (data instanceof FormData) {
      payload = data;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else if (data.imageFile || data.image instanceof File) {
      const formData = new FormData();
      if (data.brand_name) formData.append('brand_name', data.brand_name.trim());
      if (data.description !== undefined) formData.append('description', data.description ? data.description.trim() : '');
      if (data.active !== undefined) formData.append('active', data.active ? 1 : 0);
      const file = data.imageFile || data.image;
      formData.append('image', file);
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      payload = {
        brand_name: data.brand_name ? data.brand_name.trim() : undefined,
        description: data.description !== undefined ? (data.description ? data.description.trim() : null) : undefined,
        image: data.image,
        active: data.active !== undefined ? (data.active ? 1 : 0) : undefined,
      };
    }

    const response = await apiClient.put(`/brand/update/${id}`, payload, { headers });
    return response;
  },

  /**
   * Delete brand by ID
   * @param {number|string} id - Brand ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteBrand: async (id) => {
    const response = await apiClient.delete(`/brand/delete/${id}`);
    return response;
  },
};

export default brandApi;

