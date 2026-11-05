import { apiClient } from '@/services/api/axios';

/**
 * Customer API Service (tbl_customer_profile + customer orders)
 * Backend: node-api/src/route/customer.route.js
 */
export const customerApi = {
  /**
   * Get all customers with optional filters
   * @param {Object} params - { search?: string, active?: '1' | '0' | 'all' }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getCustomers: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.active !== undefined && params.active !== 'all' && params.active !== '') {
      queryParams.active = params.active;
    }
    return apiClient.get('/customer/getall', { params: queryParams });
  },

  /**
   * Get a single customer by ID
   * @param {number|string} id - Customer ID
   * @returns {Promise<{ success: boolean, data: Object }>}
   */
  getCustomerById: async (id) => {
    return apiClient.get(`/customer/getone/${id}`);
  },

  /**
   * Get customer orders with optional filters (status, search, customer_id, date range)
   * Relates: customer, customer_order, customer_order_item, customer_payment, invoice
   * @param {Object} params - { customer_id?, status?, search?, start_date?, end_date? }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getCustomerOrders: async (params = {}) => {
    const queryParams = {};
    if (params.customer_id && params.customer_id !== 'all') {
      queryParams.customer_id = params.customer_id;
    }
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.start_date) {
      queryParams.start_date = params.start_date;
    }
    if (params.end_date) {
      queryParams.end_date = params.end_date;
    }
    return apiClient.get('/customer/orders', { params: queryParams });
  },

  /**
   * Get a single customer order by order ID
   * @param {number|string} orderId - Order ID
   * @returns {Promise<{ success: boolean, data: Object }>}
   */
  getCustomerOrderById: async (orderId) => {
    return apiClient.get(`/customer/orders/${orderId}`);
  },

  /**
   * Get all orders for a specific customer
   * @param {number|string} customerId - Customer ID
   * @returns {Promise<{ success: boolean, customer: Object, summary: Object, orders: Array }>}
   */
  getOrdersByCustomerId: async (customerId) => {
    return apiClient.get(`/customer/${customerId}/orders`);
  },

  /**
   * Get customers list with their orders summary
   * @param {Object} params - { search?, has_orders? }
   * @returns {Promise<{ success: boolean, total: number, list: Array }>}
   */
  getCustomersWithOrders: async (params = {}) => {
    const queryParams = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.has_orders !== undefined) {
      queryParams.has_orders = params.has_orders;
    }
    return apiClient.get('/customer/orders/summary/by-customer', { params: queryParams });
  },

  /**
   * Update order status (pending, completed, cancelled)
   * @param {number|string} orderId - Order ID
   * @param {Object} data - { status: string, notes?: string }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  updateCustomerOrderStatus: async (orderId, data) => {
    return apiClient.put(`/customer/orders/${orderId}/status`, data);
  },
};

export default customerApi;
