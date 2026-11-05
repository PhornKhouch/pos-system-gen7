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
const {
  getCustomers,
  getCustomerById,
  getCustomerOrders,
  getCustomerOrderById,
  getOrdersByCustomerId,
  getCustomersWithOrders,
  updateCustomerOrderStatus,
} = require("../controller/customer.controller");
const { validate_token, validate_customer_token } = require("../middleware/auth");

// Storefront customer routes (tbl_customer_profile + tbl_customer_cart) + Admin customer order routes
function CustomerRoute(app) {
  // Admin: customer info (requires staff/admin token)
  app.get("/api/v1/customer/getall", validate_token(), getCustomers);
  app.get("/api/v1/customer/getone/:id", validate_token(), getCustomerById);

  // Admin: Customer Orders endpoints (relates customer, customer_order, customer_order_item, customer_payment, invoice)
  app.get("/api/v1/customer/orders", validate_token(), getCustomerOrders);
  app.get("/api/v1/customer/orders/summary/by-customer", validate_token(), getCustomersWithOrders);
  app.get("/api/v1/customer/orders/:order_id", validate_token(), getCustomerOrderById);
  app.put("/api/v1/customer/orders/:order_id/status", validate_token(), updateCustomerOrderStatus);
  app.get("/api/v1/customer/:id/orders", validate_token(), getOrdersByCustomerId);

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
