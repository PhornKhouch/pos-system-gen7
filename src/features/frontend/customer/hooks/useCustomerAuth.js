import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { customerApi } from '../services/customerApi';
import { useCustomerStore } from '../store/useCustomerStore';
import { STORE_ROUTES } from '../../storeConfig';

export const GOOGLE_REDIRECT_STATE_KEY = 'customer_google_redirect_state';

/**
 * Login / register for storefront customers.
 * Router state from useCart: { from, pendingItem } -> after auth the pending item is added
 * and the customer goes back to the page they came from.
 */
export function useCustomerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useCustomerStore((s) => s.setSession);
  const setCart = useCustomerStore((s) => s.setCart);
  const logoutStore = useCustomerStore((s) => s.logout);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notRegistered, setNotRegistered] = useState(false);

  const redirectState = location.state || {};

  // stateOverride: router state restored after a full-page redirect (Google login)
  const finishAuth = async (res, stateOverride) => {
    setSession(res.customer, res.token);

    const { pendingItem, from } = stateOverride || redirectState;
    if (pendingItem) {
      try {
        const cartRes = await customerApi.addToCart(pendingItem.productId, pendingItem.quantity);
        setCart(cartRes?.data);
        message.success(`Added ${pendingItem.quantity} × ${pendingItem.name} to your cart`);
      } catch (err) {
        message.error(err.message || 'Could not add the item to your cart');
      }
    } else {
      message.success(res.message || 'Welcome!');
      customerApi.getCart().then((cartRes) => setCart(cartRes?.data)).catch(() => {});
    }

    navigate(from || STORE_ROUTES.HOME, { replace: true });
  };

  const run = async (request) => {
    setLoading(true);
    setError(null);
    setNotRegistered(false);
    try {
      await finishAuth(await request());
    } catch (err) {
      if (err.code === 'CUSTOMER_NOT_FOUND') setNotRegistered(true);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const login = ({ email, password }) =>
    run(() => customerApi.login({ email: email.trim(), password }));

  const register = (data) =>
    run(() =>
      customerApi.register({
        customer_name: data.customer_name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
      })
    );

  // Google login leaves the SPA, so router state is lost. Keep it in sessionStorage
  // and GoogleCallback restores it (pending cart item + page to return to).
  const loginWithGoogle = () => {
    try {
      sessionStorage.setItem(GOOGLE_REDIRECT_STATE_KEY, JSON.stringify(redirectState));
    } catch {
      // storage blocked -> customer just lands on the home page after login
    }
    window.location.href = customerApi.googleLoginUrl(redirectState.from);
  };

  const logout = () => {
    logoutStore();
    message.success('You have been logged out');
    navigate(STORE_ROUTES.HOME);
  };

  return {
    login,
    register,
    loginWithGoogle,
    finishAuth,
    logout,
    loading,
    error,
    notRegistered,
    // Pass this along when switching between login <-> register so the pending item survives
    redirectState,
  };
}

export default useCustomerAuth;
