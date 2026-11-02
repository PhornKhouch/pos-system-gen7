const {createCheckoutSession ,PaymentSuccess ,generateKHQR ,verifyKHQR ,checkPaymentStatus ,cancelKHQR} = require('../controller/payment.controller');
const { validate_token } = require('../middleware/auth');
const cardpaywayRoute = (app) => {
  app.post('/api/v1/cardpayway/createCheckoutSession', createCheckoutSession);

  app.get('/api/v1/cardpayway/Success', PaymentSuccess);


  //KHQR Route (cashier must be logged in — sale is saved under req.user)
  app.post('/api/v1/cardpayway/generate' , validate_token(), generateKHQR);           // Create pending sale + KHQR
  app.post('/api/v1/cardpayway/verify' , validate_token(), verifyKHQR);               // Verify KHQR string
  app.post('/api/v1/cardpayway/check-payment' , validate_token(), checkPaymentStatus); // Poll Bakong, complete sale when paid
  app.post('/api/v1/cardpayway/cancel' , validate_token(), cancelKHQR);               // Cancel pending KHQR sale
};


module.exports = cardpaywayRoute;
