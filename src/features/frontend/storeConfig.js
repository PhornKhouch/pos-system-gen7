/**
 * Storefront (customer site) configuration
 * Brand, routes and static copy shared by every customer-facing page.
 */
export const STORE_BRAND = {
  name: 'VOLTA',
  initial: 'V',
};

const STORE_BASE = '/index';

export const STORE_ROUTES = {
  HOME: STORE_BASE,
  SHOP: `${STORE_BASE}/shop`,
  STORES: `${STORE_BASE}/stores`,
  REWARDS: `${STORE_BASE}/rewards`,
  TRACK: `${STORE_BASE}/track`,
  ACCOUNT: `${STORE_BASE}/account`,
  CART: `${STORE_BASE}/cart`,
  CHECKOUT_SUCCESS: `${STORE_BASE}/checkout/success`,
  LOGIN: `${STORE_BASE}/login`,
  REGISTER: `${STORE_BASE}/register`,
  FORGOT_PASSWORD: `${STORE_BASE}/forgot-password`,
  product: (id) => `${STORE_BASE}/product/${id}`,
};

/** Listing page URL with optional filters, e.g. shopUrl({ category: 3 }) → /index/shop?category=3 */
export function shopUrl(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return query ? `${STORE_ROUTES.SHOP}?${query}` : STORE_ROUTES.SHOP;
}

export const ANNOUNCEMENT =
  'Free same-day delivery in Phnom Penh over $50 · Pickup in 30 minutes at 4 branches';

export const HEADER_NAV = [
  { label: 'Shop', to: STORE_ROUTES.SHOP },
  { label: 'Stores', to: STORE_ROUTES.STORES },
  { label: 'Rewards', to: STORE_ROUTES.REWARDS },
  { label: 'Track order', to: STORE_ROUTES.TRACK },
];

export const FOOTER_COLUMNS = [
  { title: 'Shop', items: ['Laptops', 'Phones', 'Audio', 'Accessories'] },
  { title: 'Support', items: ['Track order', 'Warranty', 'Repairs', 'Contact'] },
  { title: 'Company', items: ['About Volta', 'Branches', 'Careers'] },
  { title: 'Pay with', items: ['KHQR / Bakong', 'ABA Pay', 'Wing', 'Visa · Mastercard'] },
];

export function formatPrice(amount = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
