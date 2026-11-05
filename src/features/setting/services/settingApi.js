import { apiClient } from '@/services/api/axios';

/**
 * General Setting API Service (tbl_general_setting)
 * Backend: node-api/src/route/generalSetting.route.js
 */
export const SETTING_TYPES = ['text', 'number', 'boolean', 'email', 'url', 'color', 'json'];

export const settingApi = {
  /**
   * Get all settings with optional filters
   * @param {Object} params - { search?: string, setting_type?: string, store_id?: 'all' | 'global' | number }
   * @returns {Promise<{ success: boolean, total: number, types: string[], list: Array }>}
   */
  getSettings: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.setting_type && params.setting_type !== 'all') {
      queryParams.setting_type = params.setting_type;
    }
    if (params.store_id !== undefined && params.store_id !== null && params.store_id !== 'all' && params.store_id !== '') {
      queryParams.store_id = params.store_id;
    }
    return apiClient.get('/setting/getall', { params: queryParams });
  },

  /** @param {number|string} id */
  getSettingById: async (id) => apiClient.get(`/setting/getone/${id}`),

  /**
   * Resolve a setting by key: store value first, global value as fallback
   * @param {string} key
   * @param {number} [storeId]
   */
  getSettingByKey: async (key, storeId) =>
    apiClient.get(`/setting/key/${encodeURIComponent(key)}`, { params: storeId ? { store_id: storeId } : {} }),

  /**
   * @param {{ setting_key: string, setting_value: any, setting_type: string, store_id: number|null }} data
   */
  createSetting: async (data) => apiClient.post('/setting/create', data),

  /**
   * @param {number|string} id
   * @param {{ setting_key?: string, setting_value?: any, setting_type?: string, store_id?: number|null }} data
   */
  updateSetting: async (id, data) => apiClient.put(`/setting/update/${id}`, data),

  /** @param {number|string} id */
  deleteSetting: async (id) => apiClient.delete(`/setting/delete/${id}`),
};

export default settingApi;
