/**
 * POS Initial State & Defaults
 * Categories and products are loaded directly from the backend API:
 * - Categories: /api/v1/category/getall (reference: node-api/api_tests/category_api_test.md)
 * - Products: /api/v1/productmaster/getall
 */

export const INITIAL_CATEGORIES = [
  { id: 'all', category_id: null, name: 'Popular' },
];

export const MOCK_PRODUCTS = [];

export const INITIAL_CART_ITEMS = [];

export const MOCK_CUSTOMERS = [
  {
    id: 'walk-in',
    name: 'Walk-in customer',
    phone: '',
    loyaltyTier: 'Standard',
    loyaltyPoints: 0,
    discountRate: 0,
  },
  {
    id: 'cust-1',
    name: 'Sophea Kim',
    phone: '012 345 678',
    email: 'sophea@example.com',
    loyaltyTier: 'Gold Member',
    loyaltyPoints: 340,
    discountRate: 5,
  },
  {
    id: 'cust-2',
    name: 'Vannak Heng',
    phone: '098 765 432',
    email: 'vannak@example.com',
    loyaltyTier: 'Silver Member',
    loyaltyPoints: 180,
    discountRate: 2,
  },
  {
    id: 'cust-3',
    name: 'Chanthy Sok',
    phone: '077 112 233',
    email: 'chanthy@example.com',
    loyaltyTier: 'Platinum VIP',
    loyaltyPoints: 850,
    discountRate: 10,
  },
];
