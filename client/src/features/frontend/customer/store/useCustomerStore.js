import { create } from 'zustand';
import { storageService } from '@/services/storage/localStorage';
import { STORAGE_KEYS } from '@/utils/constants';

const EMPTY_CART = { items: [], total_items: 0, total_quantity: 0, subtotal: 0 };

/**
 * Storefront customer session + cart.
 * Kept apart from the staff auth slice so a staff login never counts as a customer login (and vice versa).
 */
export const useCustomerStore = create((set) => ({
  customer: storageService.getItem(STORAGE_KEYS.CUSTOMER_DATA, null),
  token: storageService.getItem(STORAGE_KEYS.CUSTOMER_TOKEN, null),
  cart: EMPTY_CART,

  setSession: (customer, token) => {
    storageService.setItem(STORAGE_KEYS.CUSTOMER_DATA, customer);
    storageService.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, token);
    set({ customer, token });
  },

  setCustomer: (customer) => {
    storageService.setItem(STORAGE_KEYS.CUSTOMER_DATA, customer);
    set({ customer });
  },

  setCart: (cart) => set({ cart: cart || EMPTY_CART }),

  logout: () => {
    storageService.removeItem(STORAGE_KEYS.CUSTOMER_DATA);
    storageService.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    set({ customer: null, token: null, cart: EMPTY_CART });
  },
}));

export default useCustomerStore;
