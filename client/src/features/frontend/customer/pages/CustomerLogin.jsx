import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { useCustomerStore } from '../store/useCustomerStore';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { STORE_ROUTES, STORE_BRAND } from '../../storeConfig';
import '../customer.css';

export function CustomerLogin() {
  const token = useCustomerStore((s) => s.token);
  const { login, loginWithGoogle, loading, error, notRegistered, redirectState } = useCustomerAuth();
  // Email comes back from register / forgot password so the customer doesn't retype it
  const [form, setForm] = useState({ email: redirectState.email || '', password: '' });

  // Already logged in -> nothing to do here
  if (token && !loading) {
    return <Navigate to={redirectState.from || STORE_ROUTES.HOME} replace />;
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  const registerState = { ...redirectState, email: form.email };

  return (
    <div className="cust-auth">
      <div className="cust-auth-card">
        <span className="store-logo-mark">{STORE_BRAND.initial}</span>
        <h1>Welcome back</h1>
        <p className="cust-auth-sub">Login to your {STORE_BRAND.name} account to shop and track orders.</p>

        {redirectState.pendingItem && (
          <div className="cust-auth-notice">
            Login to add <strong>{redirectState.pendingItem.name}</strong> to your cart.
          </div>
        )}

        {error && (
          <div className="cust-auth-error">
            {error}
            {notRegistered && (
              <>
                {' '}
                <Link to={STORE_ROUTES.REGISTER} state={registerState}>
                  Create an account
                </Link>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="cust-form">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </label>
          <Link to={STORE_ROUTES.FORGOT_PASSWORD} state={registerState} className="cust-forgot-link">
            Forgot password?
          </Link>
          <button type="submit" className="store-btn store-btn-primary cust-submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <GoogleLoginButton onClick={loginWithGoogle} disabled={loading} />

        <p className="cust-auth-switch">
          New to {STORE_BRAND.name}?{' '}
          <Link to={STORE_ROUTES.REGISTER} state={registerState}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default CustomerLogin;
