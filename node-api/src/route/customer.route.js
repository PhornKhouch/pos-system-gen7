const {
  registerCustomer,
  loginCustomer,
  getMe,
  SendOTP,
  verify_Otp,
  setNewPassword,
} = require("../controller/customerAuth.controller");
const {
  initiateGoogleAuth,
  handleGoogleCallback,
  verifyGoogleCredential,
} = require("../controller/auth.controller");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controller/customerCart.controller");
const { validate_customer_token } = require("../middleware/auth");

// Storefront customer routes (tbl_customer_profile + tbl_customer_cart)
function CustomerRoute(app) {
  // Authentication
  app.post("/api/v1/customer/register", registerCustomer);
  app.post("/api/v1/customer/login", loginCustomer);
  app.get("/api/v1/customer/me", validate_customer_token(), getMe);

  ////send otp to email
  app.post("/api/v1/customer/send-otp", SendOTP);
  //verify otp
  app.post("/api/v1/customer/verify-otp", verify_Otp);
  //set new password
  app.post("/api/v1/customer/set-new-password", setNewPassword);


  // Cart (customer must be logged in)
  app.get("/api/v1/customer/cart", validate_customer_token(), getCart);
  app.post("/api/v1/customer/cart/add", validate_customer_token(), addToCart);
  app.put("/api/v1/customer/cart/update/:product_id", validate_customer_token(), updateCartItem);
  app.delete("/api/v1/customer/cart/remove/:product_id", validate_customer_token(), removeCartItem);
  app.delete("/api/v1/customer/cart/clear", validate_customer_token(), clearCart);

  // Google OAuth 2.0 (customer login). The callback redirects to the frontend /index/google-callback
  app.get("/api/v1/auth/google", initiateGoogleAuth);
  app.get("/api/v1/auth/google/callback", handleGoogleCallback);
  // For Google One-Tap / GIS button: POST { credential }
  app.post("/api/v1/auth/google/verify", verifyGoogleCredential);
}

module.exports = CustomerRoute;
