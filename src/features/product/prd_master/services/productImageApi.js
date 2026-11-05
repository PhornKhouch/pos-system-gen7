import { apiClient } from '@/services/api/axios';

/**
 * Product Image (gallery) API Service
 * Backend: node-api/src/route/productImage.route.js
 */
export const productImageApi = {
  /**
   * Get all images of a product
   * @param {number|string} productId
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getImagesByProduct: async (productId) => {
    const response = await apiClient.get(`/productimage/getbyproduct/${productId}`);
    return response;
  },

  /**
   * Upload multiple images for a product
   * @param {number|string} productId
   * @param {File[]} files - Image files
   * @param {string} [imageAlt] - Optional alt text for this batch
   * @returns {Promise<{ success: boolean, message: string, total: number, list: Array }>}
   */
  uploadImages: async (productId, files = [], imageAlt) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    if (imageAlt && imageAlt.trim()) formData.append('image_alt', imageAlt.trim());

    const response = await apiClient.post(`/productimage/upload/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response;
  },

  /**
   * Set an image as the primary image of its product
   * @param {number|string} imageId
   */
  setPrimary: async (imageId) => {
    const response = await apiClient.put(`/productimage/setprimary/${imageId}`);
    return response;
  },

  /**
   * Delete an image
   * @param {number|string} imageId
   */
  deleteImage: async (imageId) => {
    const response = await apiClient.delete(`/productimage/delete/${imageId}`);
    return response;
  },
};

export default productImageApi;
