import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { useCustomerStore } from '../store/useCustomerStore';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { STORE_ROUTES, STORE_BRAND } from '../../storeConfig';
import '../customer.css';

const MIN_PASSWORD_LENGTH = 6;

export function CustomerRegister() {
  const token = useCustomerStore((s) => s.token);
  const { register, loginWithGoogle, loading, error, redirectState } = useCustomerAuth();
  const [form, setForm] = useState({
    customer_name: '',
    email: redirectState.email || '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [formError, setFormError] = useState(null);

  if (token && !loading) {
    return <Navigate to={redirectState.from || STORE_ROUTES.HOME} replace />;
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (form.password !== form.confirm) {
      setFormError('Passwords do not match');
      return;
    }
    setFormError(null);
    register(form);
  };

  // Keep { from, pendingItem } when going back to login
  const { email, ...loginState } = redirectState;

  return (
    <div className="cust-auth">
      <div className="cust-auth-card">
        <span className="store-logo-mark">{STORE_BRAND.initial}</span>
        <h1>Create your account</h1>
        <p className="cust-auth-sub">Register once to add items to your cart and check out faster.</p>

        {redirectState.pendingItem && (
          <div className="cust-auth-notice">
            After registering, <strong>{redirectState.pendingItem.name}</strong> will be added to your cart.
          </div>
        )}

        {(formError || error) && <div className="cust-auth-error">{formError || error}</div>}

        <form onSubmit={handleSubmit} className="cust-form">
          <label>
            Full name
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Sok Dara"
              autoComplete="name"
              required
            />
          </label>
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
            Phone <span className="cust-optional">(optional)</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="012 345 678"
              autoComplete="tel"
            />
          </label>
          <div className="cust-form-row">
            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </label>
          </div>
          <button type="submit" className="store-btn store-btn-primary cust-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <GoogleLoginButton onClick={loginWithGoogle} disabled={loading} />

        <p className="cust-auth-switch">
          Already have an account?{' '}
          <Link to={STORE_ROUTES.LOGIN} state={loginState}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default CustomerRegister;
