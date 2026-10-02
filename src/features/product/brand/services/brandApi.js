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
   * Create a new brand
   * @param {Object} data - { brand_name: string, description?: string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  createBrand: async (data) => {
    const payload = {
      brand_name: data.brand_name.trim(),
      description: data.description ? data.description.trim() : null,
      active: data.active ? 1 : 0,
    };
    const response = await apiClient.post('/brand/create', payload);
    return response;
  },

  /**
   * Update brand by ID
   * @param {number|string} id - Brand ID
   * @param {Object} data - { brand_name: string, description?: string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  updateBrand: async (id, data) => {
    const payload = {
      brand_name: data.brand_name.trim(),
      description: data.description ? data.description.trim() : null,
      active: data.active ? 1 : 0,
    };
    const response = await apiClient.put(`/brand/update/${id}`, payload);
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
