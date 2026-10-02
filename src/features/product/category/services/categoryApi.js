import { apiClient } from '@/services/api/axios';

/**
 * Category API Service
 * Reference: node-api/api_tests/category_api_test.md
 */
export const categoryApi = {
  /**
   * Get all categories with optional search and active status filter
   * @param {Object} params - { search?: string, active?: number | string }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getCategories: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.active !== undefined && params.active !== 'all' && params.active !== '') {
      queryParams.active = params.active;
    }
    const response = await apiClient.get('/category/getall', { params: queryParams });
    return response;
  },

  /**
   * Create a new category
   * @param {Object} data - { category_name: string, description?: string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  createCategory: async (data) => {
    const payload = {
      category_name: data.category_name.trim(),
      description: data.description ? data.description.trim() : null,
      active: data.active ? 1 : 0,
    };
    const response = await apiClient.post('/category/create', payload);
    return response;
  },

  /**
   * Update category by ID
   * @param {number|string} id - Category ID
   * @param {Object} data - { category_name: string, description?: string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  updateCategory: async (id, data) => {
    const payload = {
      category_name: data.category_name.trim(),
      description: data.description ? data.description.trim() : null,
      active: data.active ? 1 : 0,
    };
    const response = await apiClient.put(`/category/update/${id}`, payload);
    return response;
  },

  /**
   * Delete category by ID
   * @param {number|string} id - Category ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/category/delete/${id}`);
    return response;
  },
};

export default categoryApi;
