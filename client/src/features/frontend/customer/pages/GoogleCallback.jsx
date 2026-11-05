import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services/customerApi';
import { useCustomerAuth, GOOGLE_REDIRECT_STATE_KEY } from '../hooks/useCustomerAuth';
import { STORE_ROUTES, STORE_BRAND } from '../../storeConfig';
import '../customer.css';

const readSavedState = () => {
  try {
    const saved = sessionStorage.getItem(GOOGLE_REDIRECT_STATE_KEY);
    sessionStorage.removeItem(GOOGLE_REDIRECT_STATE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

/**
 * Landing page after Google login.
 * Backend redirects here with #token=...&from=... or #error=...
 */
export function GoogleCallback() {
  const { finishAuth } = useCustomerAuth();
  const [error, setError] = useState(null);
  const started = useRef(false); // StrictMode runs effects twice in dev

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    // Remove the token from the address bar / browser history
    window.history.replaceState(null, '', window.location.pathname);

    const savedState = readSavedState();
    const token = params.get('token');

    if (params.get('error') || !token) {
      setError(params.get('error') || 'Google sign-in failed');
      return;
    }

    customerApi
      .getMe(token)
      .then((res) =>
        finishAuth(
          { token, customer: res.data, message: `Welcome, ${res.data.customer_name}!` },
          { ...savedState, from: savedState.from || params.get('from') || undefined }
        )
      )
      .catch((err) => setError(err.message || 'Google sign-in failed'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="cust-auth">
      <div className="cust-auth-card">
        <span className="store-logo-mark">{STORE_BRAND.initial}</span>
        {error ? (
          <>
            <h1>Google sign-in failed</h1>
            <div className="cust-auth-error">{error}</div>
            <p className="cust-auth-switch">
              <Link to={STORE_ROUTES.LOGIN}>Back to login</Link>
            </p>
          </>
        ) : (
          <>
            <h1>Signing you in…</h1>
            <p className="cust-auth-sub">Please wait while we finish your Google login.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;
