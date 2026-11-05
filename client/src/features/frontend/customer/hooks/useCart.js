import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { customerApi } from '../services/customerApi';
import { useCustomerStore } from '../store/useCustomerStore';
import { STORE_ROUTES } from '../../storeConfig';

/**
 * Cart actions for the storefront.
 * addToCart only works for a logged-in customer; otherwise it sends the user to the login page
 * and remembers the item so it is added right after login / register.
 */
export function useCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useCustomerStore((s) => s.token);
  const cart = useCustomerStore((s) => s.cart);
  const setCart = useCustomerStore((s) => s.setCart);

  const loadCart = useCallback(async () => {
    if (!useCustomerStore.getState().token) return;
    try {
      const res = await customerApi.getCart();
      setCart(res?.data);
    } catch {
      // 401 already cleared the session in the interceptor
    }
  }, [setCart]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!useCustomerStore.getState().token) {
        message.info('Please login to add items to your cart');
        navigate(STORE_ROUTES.LOGIN, {
          state: {
            from: location.pathname + location.search,
            pendingItem: { productId: product.id, name: product.name, quantity },
          },
        });
        return false;
      }

      try {
        const res = await customerApi.addToCart(product.id, quantity);
        setCart(res?.data);
        message.success(`Added ${quantity} × ${product.name} to your cart`);
        return true;
      } catch (err) {
        if (err.status === 401) {
          message.info('Your session expired, please login again');
          navigate(STORE_ROUTES.LOGIN, {
            state: {
              from: location.pathname + location.search,
              pendingItem: { productId: product.id, name: product.name, quantity },
            },
          });
        } else {
          message.error(err.message || 'Could not add to cart');
        }
        return false;
      }
    },
    [navigate, location, setCart]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      try {
        const res = await customerApi.updateCartItem(productId, quantity);
        setCart(res?.data);
      } catch (err) {
        message.error(err.message || 'Could not update quantity');
      }
    },
    [setCart]
  );

  const removeItem = useCallback(
    async (productId) => {
      try {
        const res = await customerApi.removeCartItem(productId);
        setCart(res?.data);
      } catch (err) {
        message.error(err.message || 'Could not remove item');
      }
    },
    [setCart]
  );

  return {
    cart,
    cartCount: cart.total_quantity || 0,
    isLoggedIn: !!token,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
  };
}

export default useCart;
