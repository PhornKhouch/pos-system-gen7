var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var {
  generateGoogleAuthUrl,
  getGoogleUserFromCode,
  verifyGoogleIdToken,
} = require('../services/googleAuth.service.js');
var { CustomerProfile } = require('../models');
var { signCustomerToken, toSafeCustomer } = require('./customerAuth.controller');
var logError = require('../helper/log_error');
var dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const isProduction = process.env.NODE_ENV === 'production';
const STATE_COOKIE = 'g_oauth_state';
const STATE_EXPIRES_MS = 10 * 60 * 1000; // 10 minutes

// Frontend page that finishes the login: /index/google-callback
const getClientCallbackUrl = () =>
  process.env.GOOGLE_SUCCESS_REDIRECT_URL || `${process.env.CLIENT_URL}/index/google-callback`;

// Only allow a path inside our own site (blocks open redirects like //evil.com)
const safeReturnPath = (from) =>
  typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '';

// Send the browser back to the frontend. Data goes in the #hash so the token
// is never sent to a server or written to access logs.
const redirectToClient = (res, params) => {
  const url = new URL(getClientCallbackUrl());
  url.hash = new URLSearchParams(params).toString();
  return res.redirect(url.toString());
};

const readCookie = (req, name) => {
  const cookies = (req.headers.cookie || '').split(';');
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
};

// An error whose message is safe to show the customer
const customerError = (message) => Object.assign(new Error(message), { isCustomerError: true });

/**
 * Find the storefront customer for a verified Google account, or create one.
 * Existing customers (registered or walk-in POS) are matched by email.
 */
const findOrCreateGoogleCustomer = async (googleUser) => {
  if (!googleUser.email || !googleUser.emailVerified) {
    throw customerError('Your Google email is not verified');
  }

  const email = googleUser.email.trim().toLowerCase();
  let customer = await CustomerProfile.findOne({ where: { email } });

  if (!customer) {
    customer = await CustomerProfile.create({
      customer_name: googleUser.name || email.split('@')[0],
      email,
      password: null, // Google-only account, no password login
      active: 1,
    });
  }

  if (customer.active !== 1) {
    throw customerError('Your account is disabled');
  }

  return customer;
};

/**
 * Step 1: Send the customer to Google's consent screen
 * Route: GET /api/v1/auth/google?from=/index/cart
 */
const initiateGoogleAuth = (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          'Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.',
      });
    }

    // CSRF protection: random nonce in an httpOnly cookie + signed state sent to Google.
    // The callback only accepts a state whose nonce matches this browser's cookie.
    const nonce = crypto.randomBytes(16).toString('hex');
    const state = jwt.sign({ nonce, from: safeReturnPath(req.query.from) }, SECRET_KEY, {
      expiresIn: '10m',
    });

    res.cookie(STATE_COOKIE, nonce, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax', // must be sent on the top-level redirect back from Google
      maxAge: STATE_EXPIRES_MS,
    });

    return res.redirect(generateGoogleAuthUrl(state));
  } catch (error) {
    logError(res, error, 'auth.initiateGoogleAuth');
  }
};

/**
 * Step 2: Google redirects back here with ?code=&state=
 * Route: GET /api/v1/auth/google/callback
 */
const handleGoogleCallback = async (req, res) => {
  const { code, error, state } = req.query;
  const nonceCookie = readCookie(req, STATE_COOKIE);
  res.clearCookie(STATE_COOKIE);

  let from = '';
  try {
    // Customer pressed "Cancel" on Google's screen
    if (error) {
      return redirectToClient(res, { error: 'Google sign-in was cancelled' });
    }

    let decodedState;
    try {
      decodedState = jwt.verify(state || '', SECRET_KEY);
    } catch (e) {
      decodedState = null;
    }
    if (!decodedState || !nonceCookie || decodedState.nonce !== nonceCookie) {
      return redirectToClient(res, { error: 'Sign-in session expired. Please try again.' });
    }
    from = decodedState.from || '';

    if (!code) {
      return redirectToClient(res, { error: 'Google did not return an authorization code' });
    }

    const googleUser = await getGoogleUserFromCode(code);
    const customer = await findOrCreateGoogleCustomer(googleUser);

    return redirectToClient(res, { token: signCustomerToken(customer), from });
  } catch (err) {
    console.error('[Google OAuth Callback Error]:', err.message);
    // Show our own messages (not verified / disabled); hide Google/DB internals
    const message = err.isCustomerError ? err.message : 'Google sign-in failed. Please try again.';
    return redirectToClient(res, { error: message, from });
  }
};

/**
 * Alternative: verify an ID token from Google Identity Services (One-Tap / GIS button)
 * Route: POST /api/v1/auth/google/verify  body: { credential }
 */
const verifyGoogleCredential = async (req, res) => {
  try {
    const idToken = req.body.token || req.body.credential || req.body.idToken;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token/credential is required in request body.',
      });
    }

    let googleUser;
    try {
      googleUser = await verifyGoogleIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
    }

    let customer;
    try {
      customer = await findOrCreateGoogleCustomer(googleUser);
    } catch (e) {
      if (!e.isCustomerError) throw e;
      return res.status(403).json({ success: false, message: e.message });
    }

    return res.status(200).json({
      success: true,
      message: `Welcome, ${customer.customer_name}!`,
      token: signCustomerToken(customer),
      customer: toSafeCustomer(customer),
    });
  } catch (error) {
    logError(res, error, 'auth.verifyGoogleCredential');
  }
};

module.exports = {
  initiateGoogleAuth,
  handleGoogleCallback,
  verifyGoogleCredential,
};
