import { apiClient } from '@/services/api/axios';

/**
 * Product Master API Service
 * Reference: node-api/api_tests/product_master_api_test.md
 */
export const productMasterApi = {
  /**
   * Get all products with optional filters (search, category, brand, attribute, active)
   * @param {Object} params - { search?: string, category_id?: number, brand_id?: number, attribute_id?: number, active?: number | string }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getProducts: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.category_id && params.category_id !== 'all') {
      queryParams.category_id = params.category_id;
    }
    if (params.brand_id && params.brand_id !== 'all') {
      queryParams.brand_id = params.brand_id;
    }
    if (params.attribute_id && params.attribute_id !== 'all') {
      queryParams.attribute_id = params.attribute_id;
    }
    if (params.active !== undefined && params.active !== 'all' && params.active !== '') {
      queryParams.active = params.active;
    }

    const response = await apiClient.get('/productmaster/getall', { params: queryParams });
    return response;
  },

  /**
   * Get single product by ID with full joined models
   * @param {number|string} id - Product ID
   * @returns {Promise<{ success: boolean, data: Object }>}
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/productmaster/getone/${id}`);
    return response;
  },

  /**
   * Create a new product master with optional image upload
   * @param {Object|FormData} data - Product details
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  createProduct: async (data) => {
    let payload;
    let headers = {};

    if (data instanceof FormData) {
      payload = data;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else if (data.imageFile || data.image instanceof File) {
      const formData = new FormData();
      formData.append('product_name', data.product_name.trim());
      formData.append('category_id', Number(data.category_id));
      formData.append('brand_id', Number(data.brand_id));
      if (data.attribute_id) formData.append('attribute_id', Number(data.attribute_id));
      formData.append('sku', data.sku.trim());
      if (data.barcode) formData.append('barcode', data.barcode.trim());
      if (data.description) formData.append('description', data.description.trim());
      formData.append('price', parseFloat(data.price));
      formData.append('cost', data.cost !== undefined && data.cost !== null ? parseFloat(data.cost) : 0);
      formData.append('quantity_stock', data.quantity_stock !== undefined && data.quantity_stock !== null ? parseInt(data.quantity_stock) : 0);
      formData.append('active', data.active ? 1 : 0);
      const file = data.imageFile || data.image;
      formData.append('image', file);
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      payload = {
        product_name: data.product_name.trim(),
        category_id: Number(data.category_id),
        brand_id: Number(data.brand_id),
        attribute_id: data.attribute_id ? Number(data.attribute_id) : null,
        sku: data.sku.trim(),
        barcode: data.barcode && data.barcode.trim() ? data.barcode.trim() : null,
        description: data.description && data.description.trim() ? data.description.trim() : null,
        image: data.image || null,
        price: parseFloat(data.price),
        cost: data.cost !== undefined && data.cost !== null ? parseFloat(data.cost) : 0,
        quantity_stock: data.quantity_stock !== undefined && data.quantity_stock !== null ? parseInt(data.quantity_stock) : 0,
        active: data.active ? 1 : 0,
      };
    }

    const response = await apiClient.post('/productmaster/create', payload, { headers });
    return response;
  },

  /**
   * Update product master by ID with optional image upload
   * @param {number|string} id - Product ID
   * @param {Object|FormData} data - Product updates
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  updateProduct: async (id, data) => {
    let payload;
    let headers = {};

    if (data instanceof FormData) {
      payload = data;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else if (data.imageFile || data.image instanceof File) {
      const formData = new FormData();
      if (data.product_name) formData.append('product_name', data.product_name.trim());
      if (data.category_id) formData.append('category_id', Number(data.category_id));
      if (data.brand_id) formData.append('brand_id', Number(data.brand_id));
      if (data.attribute_id !== undefined) {
        formData.append('attribute_id', data.attribute_id ? Number(data.attribute_id) : '');
      }
      if (data.sku) formData.append('sku', data.sku.trim());
      if (data.barcode !== undefined) formData.append('barcode', data.barcode ? data.barcode.trim() : '');
      if (data.description !== undefined) formData.append('description', data.description ? data.description.trim() : '');
      if (data.price !== undefined) formData.append('price', parseFloat(data.price));
      if (data.cost !== undefined) formData.append('cost', parseFloat(data.cost));
      if (data.quantity_stock !== undefined) formData.append('quantity_stock', parseInt(data.quantity_stock));
      if (data.active !== undefined) formData.append('active', data.active ? 1 : 0);
      const file = data.imageFile || data.image;
      formData.append('image', file);
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      payload = {
        product_name: data.product_name ? data.product_name.trim() : undefined,
        category_id: data.category_id ? Number(data.category_id) : undefined,
        brand_id: data.brand_id ? Number(data.brand_id) : undefined,
        attribute_id: data.attribute_id !== undefined ? (data.attribute_id ? Number(data.attribute_id) : null) : undefined,
        sku: data.sku ? data.sku.trim() : undefined,
        barcode: data.barcode !== undefined ? (data.barcode && data.barcode.trim() ? data.barcode.trim() : null) : undefined,
        description: data.description !== undefined ? (data.description && data.description.trim() ? data.description.trim() : null) : undefined,
        image: data.image,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        cost: data.cost !== undefined ? parseFloat(data.cost) : undefined,
        quantity_stock: data.quantity_stock !== undefined ? parseInt(data.quantity_stock) : undefined,
        active: data.active !== undefined ? (data.active ? 1 : 0) : undefined,
      };
    }

    const response = await apiClient.put(`/productmaster/update/${id}`, payload, { headers });
    return response;
  },

  /**
   * Delete product master by ID
   * @param {number|string} id - Product ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/productmaster/delete/${id}`);
    return response;
  },
};

export default productMasterApi;

