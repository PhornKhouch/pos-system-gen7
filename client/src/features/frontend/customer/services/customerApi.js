import axios from 'axios';
import { useCustomerStore } from '../store/useCustomerStore';

/**
 * Own axios instance for the storefront customer API.
 * The shared apiClient attaches the *staff* token and redirects to the staff /login on 401,
 * so customer calls use this client with the customer token instead.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const customerClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

customerClient.interceptors.request.use((config) => {
  const token = useCustomerStore.getState().token;
  // Don't override a token passed explicitly (e.g. getMe right after Google login)
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

customerClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status || 500;
    const isAuthCall = /\/customer\/(login|register)$/.test(error.config?.url || '');

    // Expired / invalid customer token -> drop the session, pages send the user to login
    if (status === 401 && !isAuthCall) {
      useCustomerStore.getState().logout();
    }

    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Request failed',
      code: error.response?.data?.code,
      status,
    });
  }
);

/**
 * Customer API Service
 * Backend: node-api/src/route/customer.route.js
 */
export const customerApi = {
  /** @param {{ customer_name, email, password, phone? }} data */
  register: (data) => customerClient.post('/customer/register', data),

  /** @param {{ email, password }} credentials */
  login: (credentials) => customerClient.post('/customer/login', credentials),

  /** @param {string} [token] use this token instead of the stored one */
  getMe: (token) =>
    customerClient.get('/customer/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined),

  /**
   * Full-page redirect URL for "Continue with Google".
   * The backend sends the customer back to /index/google-callback#token=...
   * @param {string} [from] path to return to after login
   */
  googleLoginUrl: (from) => {
    const query = from ? `?${new URLSearchParams({ from })}` : '';
    return `${API_BASE_URL}/auth/google${query}`;
  },

  // Forgot password: send-otp -> verify-otp -> set-new-password
  sendOtp: (email) => customerClient.post('/customer/send-otp', { email }),

  verifyOtp: (email, otp) => customerClient.post('/customer/verify-otp', { email, otp }),

  /** @param {{ email, otp, newPassword }} data */
  setNewPassword: (data) => customerClient.post('/customer/set-new-password', data),

  getCart: () => customerClient.get('/customer/cart'),

  addToCart: (product_id, quantity = 1) => customerClient.post('/customer/cart/add', { product_id, quantity }),

  updateCartItem: (product_id, quantity) => customerClient.put(`/customer/cart/update/${product_id}`, { quantity }),

  removeCartItem: (product_id) => customerClient.delete(`/customer/cart/remove/${product_id}`),

  clearCart: () => customerClient.delete('/customer/cart/clear'),

  // Card payment via Stripe Checkout — backend: node-api/src/route/payment.route.js
  /** Creates a pending order from the cart and returns { order_id, order_no, total_amount, session_id, url } */
  cardCheckout: (notes) => customerClient.post('/cardpayway/checkout', notes ? { notes } : {}),

  /** Confirms the Stripe session after redirect; completes the order when paid */
  verifyCardPayment: (sessionId) =>
    customerClient.get('/cardpayway/checkout/verify', { params: { session_id: sessionId } }),

  /** Cancels a pending order when the customer backs out of Stripe */
  cancelCardPayment: (orderId) => customerClient.post('/cardpayway/checkout/cancel', { order_id: orderId }),
};

export default customerApi;
