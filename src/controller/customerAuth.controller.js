const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { CustomerProfile } = require("../models");
const { IsEmpty } = require("../helper/validate");
const logError = require("../helper/log_error");
const { transporter } = require("../helper/mail_config");

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const OTP_EXPIRES_MS = 1 * 60 * 1000; // 1 minutes
const OTP_MAX_ATTEMPTS = 5;

// In-memory OTP store: { [email]: { otp, expiresAt, attempts } }
// Note: cleared when the server restarts
const otpStore = {};

const signCustomerToken = (customer) =>
  jwt.sign(
    {
      customer_id: customer.customer_id,
      email: customer.email,
      type: "customer",
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

const toSafeCustomer = (customer) => {
  const data = customer.toJSON();
  delete data.password;
  return data;
};

// 1. REGISTER CUSTOMER
const registerCustomer = async (req, res) => {
  try {
    const { customer_name, email, password, phone, address, city, country } = req.body;

    if (IsEmpty(customer_name) || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }

    if (IsEmpty(email) || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    if (IsEmpty(password) || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await CustomerProfile.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login instead.",
      });
    }

    const customer = await CustomerProfile.create({
      customer_name: customer_name.trim(),
      email: normalizedEmail,
      password: bcrypt.hashSync(password, 10),
      phone: phone && phone.trim() ? phone.trim() : null,
      address: address && address.trim() ? address.trim() : null,
      city: city && city.trim() ? city.trim() : null,
      country: country && country.trim() ? country.trim() : null,
      active: 1,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: signCustomerToken(customer),
      customer: toSafeCustomer(customer),
    });
  } catch (error) {
    logError(res, error, "customerAuth.registerCustomer");
  }
};

// 2. LOGIN CUSTOMER
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (IsEmpty(email) || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (IsEmpty(password)) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const customer = await CustomerProfile.scope("withPassword").findOne({
      where: { email: email.trim().toLowerCase() },
    });

    // Walk-in POS customers have no password yet -> treat as not registered
    if (!customer || !customer.password) {
      return res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        message: "No account found for this email. Please register first.",
      });
    }

    if (customer.active !== 1) {
      return res.status(403).json({ success: false, message: "Your account is disabled" });
    }

    if (!bcrypt.compareSync(password, customer.password)) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    res.status(200).json({
      success: true,
      message: `Welcome back, ${customer.customer_name}!`,
      token: signCustomerToken(customer),
      customer: toSafeCustomer(customer),
    });
  } catch (error) {
    logError(res, error, "customerAuth.loginCustomer");
  }
};

// 3. GET CURRENT CUSTOMER (from token)
const getMe = async (req, res) => {
  try {
    const customer = await CustomerProfile.findByPk(req.customer.customer_id);
    if (!customer || customer.active !== 1) {
      return res.status(401).json({ success: false, message: "Session expired, please login again" });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    logError(res, error, "customerAuth.getMe");
  }
};


// Shared OTP check used by verify-otp and set-new-password.
// Returns an error message, or null when the OTP is valid.
const checkOtp = (email, otp) => {
  const record = otpStore[email];
  if (!record) {
    return "OTP not found. Please request a new one.";
  }

  if (record.expiresAt < Date.now()) {
    delete otpStore[email];
    return "OTP has expired. Please request a new one.";
  }

  if (record.otp !== String(otp).trim()) {
    record.attempts += 1;
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      delete otpStore[email];
      return "Too many wrong attempts. Please request a new OTP.";
    }
    return "Invalid OTP";
  }

  return null;
};

// 4. SEND OTP (forgot password - step 1)
const SendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (IsEmpty(email) || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const customer = await CustomerProfile.scope("withPassword").findOne({
      where: { email: normalizedEmail },
    });

    // Walk-in POS customers have no password -> no account to reset
    if (!customer || !customer.password) {
      return res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        message: "No account found for this email.",
      });
    }

    if (customer.active !== 1) {
      return res.status(403).json({ success: false, message: "Your account is disabled" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[normalizedEmail] = {
      otp,
      expiresAt: Date.now() + OTP_EXPIRES_MS,
      attempts: 0,
    };

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: normalizedEmail,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${customer.customer_name},</p>
        <p>Your OTP code is:</p>
        <h3 style="color: #007bff; font-size: 24px; letter-spacing: 2px;">${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({ success: true, message: "OTP sent to your email successfully" });
  } catch (error) {
    logError(res, error, "customerAuth.SendOTP");
  }
};

// 5. VERIFY OTP (forgot password - step 2)
const verify_Otp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (IsEmpty(email) || IsEmpty(otp)) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const error = checkOtp(email.trim().toLowerCase(), otp);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // Keep the OTP in the store; set-new-password checks it again
    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    logError(res, error, "customerAuth.verify_Otp");
  }
};

// 6. SET NEW PASSWORD (forgot password - step 3)
const setNewPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (IsEmpty(email) || IsEmpty(otp)) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    if (IsEmpty(newPassword) || newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const error = checkOtp(normalizedEmail, otp);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const [updated] = await CustomerProfile.update(
      { password: bcrypt.hashSync(newPassword, 10) },
      { where: { email: normalizedEmail } }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "No account found for this email." });
    }

    // OTP can only be used once
    delete otpStore[normalizedEmail];

    res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    logError(res, error, "customerAuth.setNewPassword");
  }
};

module.exports = {
  signCustomerToken,
  toSafeCustomer,
  registerCustomer,
  loginCustomer,
  getMe,
  SendOTP,
  verify_Otp,
  setNewPassword,
};
