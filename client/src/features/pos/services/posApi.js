import { productMasterApi } from '@/features/product/prd_master/services/productMasterApi';
import { categoryApi } from '@/features/product/category/services/categoryApi';
import { apiClient } from '@/services/api/axios';

/**
 * POS API Service
 * Fetches categories and products from the backend endpoints:
 * - Categories: /api/v1/category/getall
 * - Products: /api/v1/productmaster/getall
 */
export const posApi = {
  /**
   * Fetch all active categories from backend endpoint api/v1/category/getall
   * Reference: node-api/api_tests/category_api_test.md
   * @returns {Promise<Array>} List of category objects
   */
  getCategories: async () => {
    try {
      const res = await categoryApi.getCategories({ active: 1 });
      const apiCategories = (res && res.list) || (Array.isArray(res) ? res : []);

      // Prepend 'Popular' (All Products) option, followed by active categories from the database
      return [
        { id: 'all', category_id: null, name: 'Popular' },
        ...apiCategories.map((cat) => ({
          id: String(cat.category_id),
          category_id: cat.category_id,
          name: cat.category_name,
          description: cat.description,
          active: cat.active,
        })),
      ];
    } catch (err) {
      console.error('Failed to load categories from API:', err);
      return [{ id: 'all', category_id: null, name: 'Popular' }];
    }
  },

  /**
   * Fetch all active products from backend endpoint api/v1/productmaster/getall
   * @returns {Promise<Array>} List of POS products
   */
  getProducts: async (params = {}) => {
    try {
      const res = await productMasterApi.getProducts({ active: 1, ...params });
      const apiList = (res && res.list) || (Array.isArray(res) ? res : []);

      return apiList.map((p) => {
        const catName = p.category?.category_name || '';
        const initials = (p.sku || p.product_name || 'PRD').substring(0, 3).toUpperCase();

        return {
          id: p.product_id,
          name: p.product_name,
          sku: p.sku || `SKU-${p.product_id}`,
          price: parseFloat(p.price) || 0,
          cost: parseFloat(p.cost) || 0,
          stock: p.quantity_stock !== undefined && p.quantity_stock !== null ? parseInt(p.quantity_stock) : 0,
          category_id: p.category_id,
          category: catName.toLowerCase(),
          categoryName: catName,
          barcode: p.barcode || '',
          avatarCode: initials,
          image: p.image || null,
          isPopular: true,
        };
      });
    } catch (err) {
      console.error('Failed to load products from API:', err);
      return [];
    }
  },

  /**
   * Complete checkout / sale
   */
  processCheckout: async (orderData) => {
    // Store in localStorage for persistent sales history
    const history = JSON.parse(localStorage.getItem('pos_sales_history') || '[]');
    const transaction = {
      id: `TXN-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...orderData,
    };
    history.push(transaction);
    localStorage.setItem('pos_sales_history', JSON.stringify(history));

    return {
      success: true,
      message: 'Transaction completed successfully',
      data: transaction,
    };
  },

  /**
   * Create a pending sale on the server and get a Bakong KHQR for it.
   * Prices are taken from the database; only product ids and quantities are sent.
   * @param {{ items: Array<{product_id:number, quantity:number}>, discount_percent?: number, tax_percent?: number, customer_id?: number|null, currency?: 'USD'|'KHR' }} payload
   * @returns {Promise<{ success: boolean, data: { sale_id, sale_no, qr, md5, amount, currency, total_amount, expires_at } }>}
   */
  generateKhqr: (payload) => apiClient.post('/cardpayway/generate', payload),

  /**
   * Poll payment status. When Bakong confirms payment the server saves payment + invoice.
   * @returns {Promise<{ status: 'PENDING'|'COMPLETED'|'EXPIRED'|'CANCELLED'|'MISMATCH', data?: Object }>}
   */
  checkKhqr: (saleId) => apiClient.post('/cardpayway/check-payment', { sale_id: saleId }),

  /**
   * Cancel a pending KHQR sale (server re-checks Bakong first, so a paid sale is completed instead).
   */
  cancelKhqr: (saleId) => apiClient.post('/cardpayway/cancel', { sale_id: saleId }),

  /**
   * Download the invoice PDF of a completed sale (saves it as <receiptNumber>.pdf).
   */
  downloadReceiptPdf: async (saleId, receiptNumber) => {
    const blob = await apiClient.get(`/sale/receipt/${saleId}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${receiptNumber || `receipt-${saleId}`}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

export default posApi;
