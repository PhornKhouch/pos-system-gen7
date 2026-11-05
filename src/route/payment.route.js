const {
  createCheckoutSession,
  PaymentSuccess,
  cardCheckout,
  cardVerify,
  cardCancel,
  generateKHQR,
  verifyKHQR,
  checkPaymentStatus,
  cancelKHQR,
} = require('../controller/payment.controller');
const { validate_token, validate_customer_token } = require('../middleware/auth');

const cardpaywayRoute = (app) => {
  // Stripe demo (fixed amount, no order)
  app.post('/api/v1/cardpayway/createCheckoutSession', createCheckoutSession);
  app.get('/api/v1/cardpayway/Success', PaymentSuccess);

  // Storefront card payment via Stripe Checkout (customer must be logged in — order is saved under req.customer)
  app.post('/api/v1/cardpayway/checkout', validate_customer_token(), cardCheckout);          // Cart → pending order + Stripe checkout URL
  app.get('/api/v1/cardpayway/checkout/verify', validate_customer_token(), cardVerify);      // ?session_id= → complete order when paid
  app.post('/api/v1/cardpayway/checkout/cancel', validate_customer_token(), cardCancel);     // Customer backed out of Stripe

  //KHQR Route (cashier must be logged in — sale is saved under req.user)
  app.post('/api/v1/cardpayway/generate' , validate_token(), generateKHQR);           // Create pending sale + KHQR
  app.post('/api/v1/cardpayway/verify' , validate_token(), verifyKHQR);               // Verify KHQR string
  app.post('/api/v1/cardpayway/check-payment' , validate_token(), checkPaymentStatus); // Poll Bakong, complete sale when paid
  app.post('/api/v1/cardpayway/cancel' , validate_token(), cancelKHQR);               // Cancel pending KHQR sale
};

module.exports = cardpaywayRoute;
