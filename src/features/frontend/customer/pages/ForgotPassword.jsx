import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { customerApi } from '../services/customerApi';
import { STORE_ROUTES, STORE_BRAND } from '../../storeConfig';
import '../customer.css';

const STEPS = {
  EMAIL: 'email',
  OTP: 'otp',
  PASSWORD: 'password',
};

const MIN_PASSWORD_LENGTH = 6;

/**
 * Forgot password for storefront customers.
 * 1. email -> POST /customer/send-otp
 * 2. otp -> POST /customer/verify-otp
 * 3. new password -> POST /customer/set-new-password, then back to login
 */
export function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectState = location.state || {};

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState(redirectState.email || '');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (request) => {
    setLoading(true);
    setError(null);
    try {
      await request();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e) => {
    e?.preventDefault();
    run(async () => {
      const res = await customerApi.sendOtp(email.trim());
      message.success(res.message || 'OTP sent to your email');
      setOtp('');
      setStep(STEPS.OTP);
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    run(async () => {
      await customerApi.verifyOtp(email.trim(), otp.trim());
      setStep(STEPS.PASSWORD);
    });
  };

  const handleSetPassword = (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    run(async () => {
      const res = await customerApi.setNewPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: passwords.newPassword,
      });
      message.success(res.message || 'Password reset successfully');
      // Keep the pending cart item / return page so login continues where the customer left off
      navigate(STORE_ROUTES.LOGIN, { replace: true, state: { ...redirectState, email: email.trim() } });
    });
  };

  const handlePasswordChange = (e) => setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const goToStep = (nextStep) => {
    setError(null);
    setStep(nextStep);
  };

  return (
    <div className="cust-auth">
      <div className="cust-auth-card">
        <span className="store-logo-mark">{STORE_BRAND.initial}</span>

        {step === STEPS.EMAIL && (
          <>
            <h1>Forgot password</h1>
            <p className="cust-auth-sub">Enter your account email and we'll send you a 6-digit code.</p>
          </>
        )}
        {step === STEPS.OTP && (
          <>
            <h1>Enter the code</h1>
            <p className="cust-auth-sub">
              We sent a code to <strong>{email.trim()}</strong>. It is valid for 10 minutes.
            </p>
          </>
        )}
        {step === STEPS.PASSWORD && (
          <>
            <h1>Set a new password</h1>
            <p className="cust-auth-sub">Choose a new password for {email.trim()}.</p>
          </>
        )}

        {error && <div className="cust-auth-error">{error}</div>}

        {step === STEPS.EMAIL && (
          <form onSubmit={handleSendOtp} className="cust-form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <button type="submit" className="store-btn store-btn-primary cust-submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOtp} className="cust-form">
            <label>
              Verification code
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoComplete="one-time-code"
                className="cust-otp-input"
                required
              />
            </label>
            <button type="submit" className="store-btn store-btn-primary cust-submit" disabled={loading}>
              {loading ? 'Checking…' : 'Verify code'}
            </button>
            <p className="cust-auth-switch">
              Didn't get it?{' '}
              <button type="button" className="cust-link-btn" onClick={handleSendOtp} disabled={loading}>
                Resend code
              </button>
              {' · '}
              <button type="button" className="cust-link-btn" onClick={() => goToStep(STEPS.EMAIL)}>
                Change email
              </button>
            </p>
          </form>
        )}

        {step === STEPS.PASSWORD && (
          <form onSubmit={handleSetPassword} className="cust-form">
            <label>
              New password
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                required
              />
            </label>
            <button type="submit" className="store-btn store-btn-primary cust-submit" disabled={loading}>
              {loading ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="cust-auth-switch">
          Remembered it?{' '}
          <Link to={STORE_ROUTES.LOGIN} state={{ ...redirectState, email: email.trim() }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
