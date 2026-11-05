import { apiClient } from '@/services/api/axios';

/**
 * Attribute API Service
 * Reference: node-api/api_tests/attribute_api_test.md
 */
export const attributeApi = {
  /**
   * Get all attributes with optional search and active status filter
   * @param {Object} params - { search?: string, active?: number | string }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getAttributes: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.active !== undefined && params.active !== 'all' && params.active !== '') {
      queryParams.active = params.active;
    }
    const response = await apiClient.get('/attribute/getall', { params: queryParams });
    return response;
  },

  /**
   * Create a new attribute
   * @param {Object} data - { attribute_name: string, attribute_value: string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  createAttribute: async (data) => {
    const payload = {
      attribute_name: data.attribute_name.trim(),
      attribute_value: data.attribute_value.trim(),
      active: data.active ? 1 : 0,
    };
    const response = await apiClient.post('/attribute/create', payload);
    return response;
  },

  /**
   * Update attribute by ID
   * @param {number|string} id - Attribute ID
   * @param {Object} data - { attribute_name: string, attribute_value: string, active?: number | boolean }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  updateAttribute: async (id, data) => {
    const payload = {
      attribute_name: data.attribute_name.trim(),
      attribute_value: data.attribute_value.trim(),
      active: data.active ? 1 : 0,
    };
    const response = await apiClient.put(`/attribute/update/${id}`, payload);
    return response;
  },

  /**
   * Delete attribute by ID
   * @param {number|string} id - Attribute ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteAttribute: async (id) => {
    const response = await apiClient.delete(`/attribute/delete/${id}`);
    return response;
  },
};

export default attributeApi;
